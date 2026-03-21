import type { Comment, Team, User } from "@/lib/types"

export function findUserById(users: User[], id: string) {
  return users.find((user) => user.id === id)
}

export function findTeamById(teams: Team[], id: string) {
  return teams.find((team) => team.id === id)
}

export function findCommentsByRequestId(comments: Comment[], requestId: string) {
  return comments.filter((comment) => comment.requestId === requestId)
}
