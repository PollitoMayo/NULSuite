export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthPayload {
  username: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AbilityEffectRequest {
  subject:  string;
  category: string;
  value:    string;
}

export interface AbilityRequest {
  id:              string;
  name:            string;
  entry:           string;
  triggerEvent:    string;
  triggerSubject:  string;
  triggerParam:    string;
  effectDice:      string;
  effectCondition: string;
  effects:         AbilityEffectRequest[];
}

export interface MoveEffectRequest {
  subject:  string;
  category: string;
  value:    string;
}

export interface MoveRequest {
  id:              string;
  name:            string;
  entry:           string;
  type:            string;
  category:        string;
  hitDice:         string;
  hitStat:         string;
  hitCondition:    string;
  damageDice:      string;
  damageStat:      string;
  effectDice:      string;
  effectCondition: string;
  effects:         MoveEffectRequest[];
}

export interface ArchetypeRequest {
  id:       string;
  isPublic: boolean;
  name:     string;
  emoji:    string;
  hp:       string;
  atk:      string;
  def:      string;
  spAtk:    string;
  spDef:    string;
  spd:      string;
}

export interface BotStatus {
  online: boolean;
  tag: string | null;
  guilds: number;
  ping: number;
}
