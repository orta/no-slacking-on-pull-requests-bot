// @flow

import reportPullRequests from "../reportPullRequests"
import type { PullRequest } from "../types"

describe("reportPullRequests", () => {
  const slackHandle = "U03HAB39U"
  let convo, bot

  beforeEach(() => {
    convo = {
      say: jest.fn(),
    }

    bot = {
      startPrivateConversation: jest.fn((_, callback) => {
        callback(null, convo)
      }),
    }
  })

  it("uses the user’s slack handle to start a conversation", () => {
    reportPullRequests(bot, slackHandle, [], true)
    expect(bot.startPrivateConversation).toBeCalledWith({ user: slackHandle }, expect.any(Function))
  })

  it("does not report that there are no pull requests, if not requested", () => {
    reportPullRequests(bot, slackHandle, [], false)
    expect(convo.say).not.toBeCalled()
  })

  it("reports that there are no pull requests, if requested", () => {
    reportPullRequests(bot, slackHandle, [], true)
    expect(convo.say).toBeCalledWith("You have no open PRs. Great job! :clap:", { action: "completed" })
  })

  it("reports formatted pull requests", () => {
    const pullRequest: PullRequest = {
      id: "eigen#42",
      number: 42,
      title: "Make everything > awesome",
      repo: "eigen",
      url: "https://example/pulls/42",
    }

    reportPullRequests(bot, slackHandle, [pullRequest], false)
    expect(convo.say).toBeCalledWith({
      action: "completed",
      attachments: [{
        fallback: "1 PR has been assigned to you.",
        text: "1 PR has been assigned to you.\n" +
              "<https://example/pulls/42|eigen#42: Make everything &gt; awesome>",
      }],
    })
  })
})
