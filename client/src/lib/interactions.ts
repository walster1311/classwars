'use client';

import {
  MSG_TYPES,
  FunActionType,
  PowerUpColor,
  DanceStyle,
  EmojiReactionId,
  ProjectileEventData,
  SocialInteractionEventData,
  TeacherInteractionsUpdateData
} from '@classverse/shared';
import { useClassroomStore } from './store';
import { colyseusService } from './colyseus';
import { soundEffects } from './soundFx';

class InteractionsService {
  private cooldowns = new Map<FunActionType, number>();

  getCooldownRemaining(action: FunActionType): number {
    const expiresAt = this.cooldowns.get(action) || 0;
    const remaining = expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  setCooldown(action: FunActionType, durationMs: number) {
    this.cooldowns.set(action, Date.now() + durationMs);
  }

  // 1. Paper Ball Toss
  tossPaperBall(targetSessionId?: string, targetPos?: { x: number; y: number; z: number }) {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('paper_ball');
    if (remaining > 0) {
      store.showToast(`Paper ball on cooldown (${remaining}s)`, 'error');
      return false;
    }

    if (store.funActionsMode === 'lesson') {
      store.showToast('Paper ball toss is disabled during Lesson Mode.', 'error');
      return false;
    }

    if (!store.allowPaperBall) {
      store.showToast('Paper ball toss is currently disabled by teacher.', 'error');
      return false;
    }

    const myPlayer = store.players[store.mySessionId];
    if (!myPlayer) return false;

    // Calculate initial launch direction towards target
    const startPos = { x: myPlayer.x, y: 1.0, z: myPlayer.z };
    let velocity = { x: 0, y: 3.5, z: -7.0 };

    if (targetPos) {
      const dx = targetPos.x - startPos.x;
      const dz = targetPos.z - startPos.z;
      const dist = Math.hypot(dx, dz);
      const speed = Math.min(10, Math.max(5, dist * 1.5));
      velocity = {
        x: (dx / dist) * speed,
        y: Math.min(4.5, 2.0 + dist * 0.25),
        z: (dz / dist) * speed
      };
    } else {
      // Aim forward based on player rotation
      const rotY = myPlayer.rotY || 0;
      velocity = {
        x: Math.sin(rotY) * 6.5,
        y: 2.8,
        z: Math.cos(rotY) * 6.5
      };
    }

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.PROJECTILE_LAUNCH, {
        type: 'paper_ball',
        startPos,
        velocity,
        targetSessionId,
        targetPos,
        power: 1.0
      });
    } else {
      store.addProjectile({
        id: `ball_offline_${Date.now()}`,
        type: 'paper_ball',
        ownerSessionId: store.mySessionId,
        ownerName: store.myDisplayName || 'Student',
        startPos,
        velocity,
        targetSessionId,
        targetPos,
        timestamp: Date.now()
      });
      if (targetSessionId) {
        setTimeout(() => {
          soundEffects.playPaperHit();
          store.showToast('💥 Paper ball hit target!', 'info');
        }, 900);
      }
    }

    this.setCooldown('paper_ball', 8000);
    soundEffects.playPaperWhoosh();
    return true;
  }

  // 2. Paper Airplane Launch
  launchPaperAirplane(power: number = 1.0, directionRotY?: number) {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('paper_airplane');
    if (remaining > 0) {
      store.showToast(`Paper airplane on cooldown (${remaining}s)`, 'error');
      return false;
    }

    if (store.funActionsMode === 'lesson') {
      store.showToast('Paper airplanes are disabled during Lesson Mode.', 'error');
      return false;
    }

    if (!store.allowPaperAirplane) {
      store.showToast('Paper airplanes are currently disabled by teacher.', 'error');
      return false;
    }

    const myPlayer = store.players[store.mySessionId];
    if (!myPlayer) return false;

    const startPos = { x: myPlayer.x, y: 1.1, z: myPlayer.z };
    const rot = directionRotY !== undefined ? directionRotY : (myPlayer.rotY || 0);

    const speed = 4.0 + power * 5.0; // 4 to 9 m/s glide speed
    const velocity = {
      x: Math.sin(rot) * speed,
      y: 1.2 + power * 0.8,
      z: Math.cos(rot) * speed
    };

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.PROJECTILE_LAUNCH, {
        type: 'paper_airplane',
        startPos,
        velocity,
        power
      });
    } else {
      store.addProjectile({
        id: `airplane_offline_${Date.now()}`,
        type: 'paper_airplane',
        ownerSessionId: store.mySessionId,
        ownerName: store.myDisplayName || 'Student',
        startPos,
        velocity,
        power,
        timestamp: Date.now()
      });
    }

    this.setCooldown('paper_airplane', 6000);
    soundEffects.playAirplaneGlide();
    return true;
  }

  // 3. High Five Request
  requestHighFive(targetSessionId: string) {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('high_five');
    if (remaining > 0) {
      store.showToast(`High five on cooldown (${remaining}s)`, 'error');
      return false;
    }

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_REQUEST, {
        type: 'high_five',
        targetSessionId
      });
    } else {
      soundEffects.playHighFiveSnap();
      const myPlayer = store.players[store.mySessionId];
      if (myPlayer) {
        store.addSparkle({ x: myPlayer.x + 0.3, y: 1.2, z: myPlayer.z - 0.3 });
      }
      store.showToast('🙌 High five with classmate!', 'success');
    }

    this.setCooldown('high_five', 4000);
    soundEffects.playClick();
    return true;
  }

  // 4. Dance Battle Challenge
  requestDanceBattle(targetSessionId: string, danceStyle?: DanceStyle) {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('dance_battle');
    if (remaining > 0) {
      store.showToast(`Dance battle on cooldown (${remaining}s)`, 'error');
      return false;
    }

    if (store.funActionsMode === 'lesson') {
      store.showToast('Dance battles are disabled during Lesson Mode.', 'error');
      return false;
    }

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_REQUEST, {
        type: 'dance_battle',
        targetSessionId,
        danceStyle
      });
    } else {
      const style = danceStyle || 'cute_side_step';
      store.upsertPlayer(store.mySessionId, { activeDance: style });
      store.upsertPlayer('sess_sakura', { activeDance: 'anime_victory' });
      soundEffects.playDanceBeat();
      store.showToast('🎵 Dance Battle with Sakura Chibi!', 'info');
      setTimeout(() => {
        store.upsertPlayer(store.mySessionId, { activeDance: undefined });
        store.upsertPlayer('sess_sakura', { activeDance: undefined });
        store.showToast('🎉 Dance Battle Complete! Amazing moves!', 'success');
      }, 10000);
    }

    this.setCooldown('dance_battle', 12000);
    soundEffects.playClick();
    return true;
  }

  // 5. Follow Friend Request
  requestFollow(targetSessionId: string) {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('follow');
    if (remaining > 0) {
      store.showToast(`Follow on cooldown (${remaining}s)`, 'error');
      return false;
    }

    if (store.funActionsMode === 'lesson') {
      store.showToast('Follow Friend is disabled during Lesson Mode.', 'error');
      return false;
    }

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_REQUEST, {
        type: 'follow',
        targetSessionId
      });
    } else {
      store.setFollowingSessionId(targetSessionId || 'sess_sakura');
      store.showToast('Now following classmate! (Move WASD to stop)', 'info');
    }

    this.setCooldown('follow', 3000);
    soundEffects.playClick();
    return true;
  }

  // 6. Respond to Social Interaction Request (Accept/Decline)
  respondToInvite(interactionId: string, accept: boolean) {
    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_RESPOND, {
        interactionId,
        accept
      });
    }
    useClassroomStore.getState().setPendingInvite(null);
  }

  // 7. Cancel Follow
  cancelFollow() {
    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_CANCEL, {});
    }
    useClassroomStore.getState().setFollowingSessionId(null);
    useClassroomStore.getState().showToast('Stopped following', 'info');
  }

  // 8. Anime Power-Up
  triggerPowerUp(color: PowerUpColor = 'golden') {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('power_up');
    if (remaining > 0) {
      store.showToast(`Power-up on cooldown (${remaining}s)`, 'error');
      return false;
    }

    if (store.funActionsMode === 'lesson') {
      store.showToast('Anime Power-Up is disabled during Lesson Mode.', 'error');
      return false;
    }

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_TRIGGER, {
        action: 'power_up',
        data: { color }
      });
    } else {
      store.upsertPlayer(store.mySessionId, { activeAuraColor: color });
      setTimeout(() => {
        store.upsertPlayer(store.mySessionId, { activeAuraColor: undefined });
      }, 5000);
    }

    this.setCooldown('power_up', 6000);
    soundEffects.playPowerUpCharging(color);
    return true;
  }

  // 9. Floating Emoji Reaction
  triggerEmoji(emojiId: EmojiReactionId, emojiChar: string) {
    const store = useClassroomStore.getState();
    const remaining = this.getCooldownRemaining('emoji');
    if (remaining > 0) return false;

    const room = colyseusService.getRoom();
    if (room) {
      room.send(MSG_TYPES.INTERACTION_TRIGGER, {
        action: 'emoji',
        data: { emojiId, emojiChar }
      });
    } else {
      store.triggerReaction(emojiChar, store.mySessionId);
    }

    this.setCooldown('emoji', 1200);
    soundEffects.playEmojiPop();
    return true;
  }

  // 10. Teacher Classroom Interaction Governance
  updateTeacherSettings(settings: TeacherInteractionsUpdateData) {
    colyseusService.getRoom()?.send(MSG_TYPES.TEACHER_UPDATE_INTERACTIONS, settings);
  }
}

export const interactionsService = new InteractionsService();
