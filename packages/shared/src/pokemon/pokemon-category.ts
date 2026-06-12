const MOVE_CATEGORY_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/c5aaa610ff2acdf7fd8e2dccd181bca8be9fcb3e/misc/seals/home/";

export enum MoveCategory {
    PHYSICAL = "PHYSICAL",
    SPECIAL = "SPECIAL",
    STATUS = "STATUS",
}

export const MOVE_CATEGORY_LABELS: Record<string, string> = {
    [MoveCategory.PHYSICAL]: "Físico",
    [MoveCategory.SPECIAL]: "Especial",
    [MoveCategory.STATUS]: "Estado",
};

export const MOVE_CATEGORY_ICON: Record<string, string> = {
    [MoveCategory.PHYSICAL]: `${MOVE_CATEGORY_BASE}move-physical.png`,
    [MoveCategory.SPECIAL]: `${MOVE_CATEGORY_BASE}move-special.png`,
    [MoveCategory.STATUS]: `${MOVE_CATEGORY_BASE}move-status.png`,
};

export const MOVE_CATEGORY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    [MoveCategory.PHYSICAL]: { bg: "#3a2010", color: "#f0a060", border: "#8a4010" },
    [MoveCategory.SPECIAL]: { bg: "#1a1a3a", color: "#8080f0", border: "#3a3a8a" },
    [MoveCategory.STATUS]: { bg: "#2a1a3a", color: "#c080f0", border: "#6a3a8a" },
};