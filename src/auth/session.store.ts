import { Injectable } from '@nestjs/common';

export interface SessionData {
  sessionId: string;
  userId: number;
  username: string;
  role: 'admin' | 'user';
  loginTime: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionStore {
  private static sessions: Map<string, SessionData> = new Map();

  create(
    userId: number,
    username: string,
    role: 'admin' | 'user',
    metadata?: any,
  ): string {
    const sessionId = this.generateSessionId();

    const sessionData: SessionData = {
      sessionId,
      userId,
      username,
      role,
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    };

    SessionStore.sessions.set(sessionId, sessionData);
    console.log(`✅ Session created: ${sessionId} for user ${userId}`);
    return sessionId;
  }

  get(sessionId: string): SessionData | undefined {
    return SessionStore.sessions.get(sessionId);
  }

  updateActivity(sessionId: string): boolean {
    const session = SessionStore.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      return true;
    }
    return false;
  }

  delete(sessionId: string): boolean {
    const deleted = SessionStore.sessions.delete(sessionId);
    if (deleted) {
      console.log(`❌ Session deleted: ${sessionId}`);
    }
    return deleted;
  }

  getByUserId(userId: number): SessionData[] {
    return Array.from(SessionStore.sessions.values()).filter(
      (s) => s.userId === userId,
    );
  }

  deleteByUserId(userId: number): number {
    let count = 0;
    for (const [sessionId, session] of SessionStore.sessions.entries()) {
      if (session.userId === userId) {
        SessionStore.sessions.delete(sessionId);
        count++;
      }
    }
    console.log(`❌ ${count} session(s) deleted for user ${userId}`);
    return count;
  }

  getAll(): SessionData[] {
    return Array.from(SessionStore.sessions.values());
  }

  cleanExpired(maxAgeMs: number = 3600000): number {
    let count = 0;
    const now = Date.now();

    for (const [sessionId, session] of SessionStore.sessions.entries()) {
      const age = now - session.lastActivity.getTime();
      if (age > maxAgeMs) {
        SessionStore.sessions.delete(sessionId);
        count++;
      }
    }

    if (count > 0) {
      console.log(`🧹 ${count} expired session(s) cleaned`);
    }
    return count;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  getCount(): number {
    return SessionStore.sessions.size;
  }
}
