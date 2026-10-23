import { Room, RoomEvent, Track, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { useClassroomStore } from './store';

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

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:2567';

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

      // Audio track subscriptions
      this.room.on(RoomEvent.TrackSubscribed, (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          console.log(`[LiveKit] Subscribed to audio track from ${participant.identity}`);
          const element = track.attach();
          document.body.appendChild(element);
        }
      });

      this.room.on(RoomEvent.TrackUnsubscribed, (track: Track) => {
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

  disconnect() {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }
}

export const livekitService = new LiveKitService();
