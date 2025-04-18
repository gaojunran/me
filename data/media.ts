// 媒体消费。TODO。

export type MediaType = 'anime' | 'book' | 'movie' | 'drama' | 'game'
export type MediaState = 'done' | 'doing' | 'todo'

export interface MediaRecord {
  name: string
  creator?: string
  state?: MediaState
  date?: string
  note?: string
  lang?: string
}

export const anime: MediaRecord[] = [
  
]

export const book: MediaRecord[] = [
  
]

export const movie: MediaRecord[] = [
  
]

export const drama: MediaRecord[] = [
  
]

export const game: MediaRecord[] = [
  
]

export const media: Record<MediaType, MediaRecord[]> = {
  anime,
  drama,
  movie,
  game,
  book,
}
