import { useClassroomStore } from './store';
import { colyseusService } from './colyseus';
import { livekitService } from './livekit';

class ScreenShareService {
  private localVideoElement: HTMLVideoElement | null = null;

  async startScreenShare(): Promise<boolean> {
    const store = useClassroomStore.getState();
    if (store.myRole !== 'teacher') {
      store.showToast('Only teachers can share their desktop screen with the classroom.', 'error');
      return false;
    }

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getDisplayMedia) {
      store.showToast('Screen sharing is not supported by your current browser.', 'error');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always'
        } as any,
        audio: false
      });

      // Create or reuse hidden video element for Three.js VideoTexture
      if (!this.localVideoElement) {
        this.localVideoElement = document.createElement('video');
        this.localVideoElement.autoplay = true;
        this.localVideoElement.playsInline = true;
        this.localVideoElement.muted = true;
        this.localVideoElement.style.position = 'fixed';
        this.localVideoElement.style.top = '-9999px';
        this.localVideoElement.style.left = '-9999px';
        this.localVideoElement.style.opacity = '0';
        this.localVideoElement.style.pointerEvents = 'none';
        document.body.appendChild(this.localVideoElement);
      }

      this.localVideoElement.srcObject = stream;
      await this.localVideoElement.play();

      // Listen for stream stop (e.g. user clicks browser's native "Stop sharing" button)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopScreenShare();
        };
      }

      // Update store
      store.setScreenStream(stream, this.localVideoElement);
      store.setScreenSharingState(true, store.mySessionId, store.myDisplayName);

      // Notify Colyseus
      colyseusService.sendStartScreenShare(store.myDisplayName);

      // Publish to LiveKit if connected
      await livekitService.publishScreenTrack(stream);

      store.showToast('📺 Desktop screen sharing active on the front blackboard!', 'success');
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        store.showToast('Screen share permission was cancelled.', 'info');
      } else {
        console.error('[ScreenShare Error]', err);
        store.showToast(`Could not share screen: ${err.message}`, 'error');
      }
      return false;
    }
  }

  async stopScreenShare() {
    const store = useClassroomStore.getState();

    // Stop all local media tracks
    if (store.screenStream) {
      store.screenStream.getTracks().forEach((t) => t.stop());
    }

    if (this.localVideoElement) {
      this.localVideoElement.srcObject = null;
    }

    store.setScreenStream(null, null);
    store.setScreenSharingState(false, '', '');

    // Notify Colyseus
    colyseusService.sendStopScreenShare();

    // Unpublish from LiveKit
    await livekitService.unpublishScreenTrack();

    store.showToast('Desktop screen sharing ended. Blackboard restored.', 'info');
  }

  async toggleScreenShare() {
    const store = useClassroomStore.getState();
    if (store.isScreenSharing && (store.screenSharePresenterId === store.mySessionId || store.myRole === 'teacher')) {
      await this.stopScreenShare();
    } else {
      await this.startScreenShare();
    }
  }
}

export const screenShareService = new ScreenShareService();
