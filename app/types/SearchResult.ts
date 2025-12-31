type BaseSearchResult = {
    id: string,
    title: string,
    url: string,
}

type BaseInProjectSearchResult = {
    projectId: string,
    projectTitle: string,
} & BaseSearchResult

type BaseInBoardSearchResult = {
    boardId: string,
    boardTitle: string,
} & BaseInProjectSearchResult

export type ProjectSearchResult = {
    type: "project",
} & BaseSearchResult

export type DocumentSearchResult = {
    type: "document",
} & BaseInProjectSearchResult

export type BoardSearchResult = {
    type: "board",
} & BaseInProjectSearchResult

export type SectionSearchResult = {
    type: "section",
} & BaseInBoardSearchResult

export type ItemSearchResult = {
    type: "item",
} & BaseInBoardSearchResult

export type CheckItemSearchResult = {
    type: "check-item",
} & BaseInBoardSearchResult

export type SearchResult =
    ProjectSearchResult |
    DocumentSearchResult |
    BoardSearchResult |
    SectionSearchResult |
    ItemSearchResult |
    CheckItemSearchResult