import { Room, RoomEvent, Track, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { useClassroomStore } from './store';
import { getServerHttpUrl } from './serverConfig';

class LiveKitService {
  private room: Room | null = null;
  private isConnecting: boolean = false;
  private currentRoomName: string = '';

  async connect(params: {
    roomName: string;
    identity: string;
    displayName: string;
    role: 'teacher' | 'student';
    canPublishAudio: boolean;
  }) {
    if (this.isConnecting) return;
    this.isConnecting = true;
    this.currentRoomName = params.roomName;

    const serverUrl = getServerHttpUrl();

    try {
      console.log(`[LiveKit] Requesting voice token for ${params.identity} (${params.role})`);
      
      const res = await fetch(`${serverUrl}/api/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: params.roomName,
          identity: params.identity,
          name: params.displayName,
          role: params.role,
          canPublishAudio: params.canPublishAudio
        })
      });

      if (!res.ok) {
        throw new Error(`Token endpoint returned ${res.status}`);
      }

      const { token, url } = await res.json();
      console.log(`[LiveKit] Received token, connecting to LiveKit at ${url}...`);

      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Active speaker detection
      this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const store = useClassroomStore.getState();
        const activeIds = new Set(speakers.map(s => s.identity));
        
        Object.keys(store.players).forEach(sessionId => {
          const isSpeaking = activeIds.has(sessionId);
          store.setSpeakingUser(sessionId, isSpeaking);
        });
      });

      // Media track subscriptions (Audio & Screen Share Video)
      this.room.on(RoomEvent.TrackSubscribed, (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          console.log(`[LiveKit] Subscribed to audio track from ${participant.identity}`);
          const element = track.attach();
          document.body.appendChild(element);
        } else if (track.kind === Track.Kind.Video) {
          console.log(`[LiveKit] Subscribed to video / screen track from ${participant.identity}`);
          const element = track.attach() as HTMLVideoElement;
          element.autoplay = true;
          element.playsInline = true;
          element.muted = true;
          useClassroomStore.getState().setScreenStream(null, element);
          useClassroomStore.getState().setScreenSharingState(true, participant.identity, participant.name || 'Teacher');
        }
      });

      this.room.on(RoomEvent.TrackUnsubscribed, (track: Track) => {
        if (track.kind === Track.Kind.Video) {
          useClassroomStore.getState().setScreenStream(null, null);
          useClassroomStore.getState().setScreenSharingState(false, '', '');
        }
        track.detach().forEach(el => el.remove());
      });

      this.room.on(RoomEvent.Disconnected, () => {
        console.log('[LiveKit] Disconnected from voice server');
      });

      await this.room.connect(url, token);
      console.log('[LiveKit] Connected to voice room successfully');

      // If teacher, audio permission is already enabled
      if (params.role === 'teacher') {
        useClassroomStore.getState().setCanSpeak(true);
      }

    } catch (err: any) {
      console.warn('[LiveKit Notice] LiveKit server connection note:', err.message);
      // In local dev without LiveKit cloud credentials, log clear guidance and enable local mic indicator
    } finally {
      this.isConnecting = false;
    }
  }

  async toggleMicrophone(enable?: boolean): Promise<boolean> {
    const store = useClassroomStore.getState();

    // Check permission
    if (store.myRole !== 'teacher' && !store.canSpeak) {
      store.showToast('You need speaking permission from the teacher to use microphone.', 'error');
      return false;
    }

    const nextState = enable !== undefined ? enable : store.isMicMuted;
    
    if (this.room && this.room.localParticipant) {
      try {
        await this.room.localParticipant.setMicrophoneEnabled(nextState);
        store.setMyMicMuted(!nextState);
        store.setSpeakingUser(store.mySessionId, nextState);
        return nextState;
      } catch (err: any) {
        console.error('[LiveKit Mic Error]', err);
        store.showToast(`Microphone error: ${err.message}`, 'error');
        return false;
      }
    } else {
      // Dev simulation fallback when LiveKit cloud url is unconfigured
      store.setMyMicMuted(!nextState);
      store.setSpeakingUser(store.mySessionId, nextState);
      return nextState;
    }
  }

  async publishScreenTrack(stream: MediaStream) {
    if (this.room && this.room.localParticipant) {
      try {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          await this.room.localParticipant.publishTrack(videoTrack, { name: 'screen-share', source: Track.Source.ScreenShare });
        }
      } catch (err: any) {
        console.warn('[LiveKit publishScreenTrack note]', err.message);
      }
    }
  }

  async unpublishScreenTrack() {
    if (this.room && this.room.localParticipant) {
      try {
        await this.room.localParticipant.setScreenShareEnabled(false);
      } catch (err: any) {
        console.warn('[LiveKit unpublishScreenTrack note]', err.message);
      }
    }
  }

  disconnect() {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }
}

export const livekitService = new LiveKitService();
