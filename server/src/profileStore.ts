import { ChibiCharacterConfig, APPROVED_HAIRSTYLES, CharacterType, UniformId } from '@classverse/shared';

export interface UserProfile {
  userId: string;
  displayName: string;
  role: 'student' | 'teacher';
  character?: ChibiCharacterConfig;
  createdAt: number;
  updatedAt: number;
}

class ProfileStore {
  private profiles = new Map<string, UserProfile>();

  constructor() {
    // Seed default sample accounts for demonstration and test convenience
    const demoAccounts: Array<{ ids: string[]; characterType: CharacterType; hairstyleId: string; displayName: string }> = [
      { ids: ['student_alex', 'usr_student_alex'], characterType: 'boy', hairstyleId: 'boy_spiky_anime', displayName: 'Student Alex' },
      { ids: ['student_maya', 'usr_student_maya'], characterType: 'girl', hairstyleId: 'girl_twin_tails', displayName: 'Student Maya' },
      { ids: ['student_liam', 'usr_student_liam'], characterType: 'boy', hairstyleId: 'boy_classic_short', displayName: 'Student Liam' },
      { ids: ['student_sophia', 'usr_student_sophia'], characterType: 'girl', hairstyleId: 'girl_bob_cut', displayName: 'Student Sophia' },
      { ids: ['student_noah', 'usr_student_noah'], characterType: 'boy', hairstyleId: 'boy_messy', displayName: 'Student Noah' },
      { ids: ['student_seata', 'usr_student_seata'], characterType: 'boy', hairstyleId: 'boy_wavy', displayName: 'Student SeatA' },
      { ids: ['student_seatb', 'usr_student_seatb'], characterType: 'girl', hairstyleId: 'girl_long_straight', displayName: 'Student SeatB' }
    ];

    for (const acc of demoAccounts) {
      for (const id of acc.ids) {
        this.saveCharacter(id, {
          characterType: acc.characterType,
          hairstyleId: acc.hairstyleId,
          displayName: acc.displayName,
          role: 'student'
        });
      }
    }
  }

  getProfile(userId: string): UserProfile | undefined {
    return this.profiles.get(userId);
  }

  getCharacter(userId: string): ChibiCharacterConfig | undefined {
    return this.profiles.get(userId)?.character;
  }

  saveCharacter(
    userId: string,
    data: {
      characterType: CharacterType;
      hairstyleId: string;
      displayName?: string;
      role?: 'student' | 'teacher';
    }
  ): { success: boolean; character?: ChibiCharacterConfig; error?: string } {
    // 1. Validate characterType
    if (data.characterType !== 'boy' && data.characterType !== 'girl') {
      return { success: false, error: 'Invalid character type. Must be "boy" or "girl".' };
    }

    // 2. Validate hairstyleId
    const allowedHairstyles = APPROVED_HAIRSTYLES[data.characterType];
    if (!allowedHairstyles || !allowedHairstyles.includes(data.hairstyleId)) {
      return {
        success: false,
        error: `Invalid hairstyle "${data.hairstyleId}" for ${data.characterType}. Allowed: ${allowedHairstyles.join(', ')}`
      };
    }

    // 3. Assign server-determined uniform
    const uniformId: UniformId = data.characterType === 'boy' ? 'boy_standard' : 'girl_standard';

    const character: ChibiCharacterConfig = {
      characterType: data.characterType,
      hairstyleId: data.hairstyleId,
      uniformId,
      characterVersion: 1,
      selectionCompleted: true
    };

    const existing = this.profiles.get(userId);
    const now = Date.now();
    this.profiles.set(userId, {
      userId,
      displayName: data.displayName || existing?.displayName || 'Student',
      role: data.role || existing?.role || 'student',
      character,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    });

    return { success: true, character };
  }

  hasValidCharacter(userId: string): boolean {
    const char = this.getCharacter(userId);
    if (!char) return false;
    if (!char.selectionCompleted) return false;
    if (char.characterType !== 'boy' && char.characterType !== 'girl') return false;
    const allowed = APPROVED_HAIRSTYLES[char.characterType];
    return !!(allowed && allowed.includes(char.hairstyleId));
  }
}

export const profileStore = new ProfileStore();
