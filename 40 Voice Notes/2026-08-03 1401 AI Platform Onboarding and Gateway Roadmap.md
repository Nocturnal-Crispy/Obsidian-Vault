---
date: 2026-08-03
time: 14:01
duration: 35m
participants:
  - Me
  - Arne
tags:
  - meeting
  - ai-gateway
  - onboarding
  - mcp
  - cost-management
  - platform-engineering
source: note-taker
---

# AI Platform Onboarding and Gateway Roadmap

## Summary

Onboarding / orientation call between Arne (AI Platforms lead at FanDuel, part of the APEX AI Engineering & User Experiences team) and a newly joined consultant from Zepta. Arne gave a ~20-minute rundown of the team's mission, current builds, and priorities, centered on the Kong-based AI Gateway as the single ingress/egress point for all AI traffic. The new joiner walked through their background (8 years consulting, ex-AWS Professional Services, recent work on FanDuel API gateway control/data planes with John Kleiner's team) and agreed to start with API key provisioning automation. Access, Slack/Jira onboarding, and standup invites were arranged, with a follow-up meeting 25 minutes later.

## Key Points

- **Team context**: APEX / AI Platforms is a new team (formed ~5 months ago, official ~1-2 months). Current members: Arne, Imran, Leo, Sam, Jonathan (joined a month ago), MK, Tony. Actively hiring contractors and permanent staff. Arne was previously Director of Foundational Infrastructure and Platform Engineering; describes this as a greenfield environment with no legacy baggage.
- **AI Gateway**: positioned as the single egress/ingress point for all AI traffic. Built on Kong. Rolling out tomorrow to all Claude CLI users. Next targets: Claude Desktop, then Claude third-party inference (waiting on Leo's web search MCP).
- **Top priorities**: semantic caching, semantic routing, metering and billing, MCP registry/gateway.
- **Cost pressure**: ~$480k/month spend on Claude against a ~$90k/month budget. Cursor spend described as astronomical and is next onto the gateway, followed by Codex/ChatGPT. Managing five separate developer services doesn't scale.
- **Model governance**: strong org-wide bias toward Opus for no clear reason; currently on 4.8. Fable is blocked at the org level over prompts being sent back to Anthropic for model training. Grok is banned outright over data/prompt leakage concerns.
- **MCP work**: goal is parity with the existing security MCP server, then decommission it and make the registry/gateway the authoritative MCP source. Known gap — the GitHub MCP in the gateway requires manually provisioning a PAT into a file, versus the OIDC-to-Okta flow available in Claude Desktop. Leo is exploring putting Kong in front of auth. Developer onboarding for MCPs is currently a poor experience.
- **Decoupling from John's team**: too many dependencies back to platform engineering; Kong announced a beta AI Gateway separate from the API gateway, which would allow an independent deployment/release path and self-managed PR approvals.
- **Data/analytics**: ongoing conversations with Databricks to log everything into the warehouse for analytics and ML, creating a governance flywheel. PII and sensitive data handling is the next hurdle (e.g. HR conversations, executive prompts must not be searchable).
- **API key provisioning**: today it's a manual request to John or others. Goal is auto-provisioning gated on responsible-AI/governance approval, driven from the new APEX Jira board (received Friday afternoon).
- **Initialize platform**: agent platform foundation integrating with Kong out of the box — go from a Claude skill to an agent, built via GUI or as code (skill/YAML files in GitHub) and registered on the platform. Braintrust runs as the eval engine and needs to be wired into the deploy pipeline before agents hit production. Okta AI is being explored for agent identity and lifecycle management (agents have no email, so standard Okta registration fails). A GitHub scan by Arne and Tony found ~2,000 agent definitions by filename.
- **Longer term**: own inference models hosted on Bedrock behind the gateway (possibly small models on laptops), plus a context spine/mesh. Scope spans the whole org (finance, marketing, sales, GCP, Salesforce), not just AWS-shaped problems.
- **Commercial**: Claude and Cursor are bought through AWS Marketplace under the Flutter group EDP contract (~27% discount on most AWS services); a PPA is being explored to push costs down further.
- **Ways of working**: near-daily gateway standups, planning horizon of about two weeks max, priorities described as fluid and often inverted by Friday.
- **New joiner background**: 8 years consulting (started at AWS Professional Services, joined Dan's team at Zepta ~2 years ago). Migrated ~800TB from DynamoDB to S3 Tables (Iceberg) saving ~98% / millions of dollars. Recent FanDuel work on API gateway control planes and data planes via Argo and the GitHub CI/CD pipeline, where sequential PRs against a single shared file were the main bottleneck. Also has dashboard and data lake experience.

## Decisions

- API key provisioning automation will be the new joiner's first priority; Arne and John were meeting on this immediately after the call.
- The MCP registry/gateway will be the only MCP server in FanDuel for enterprise and custom-developed MCPs; the existing security MCP server will be decommissioned once parity is reached.
- Build the new/separate AI Gateway deployment the right way from day one rather than investing heavily in untangling repo ownership from John's team.
- Deliver metering and billing in phases with incremental value rather than pursuing a gold-plated solution, since "what good looks like" isn't yet clear.
- Grok will not be deployed in the org despite Cursor shipping a semantic routing version that depends on it.
- Standups: daily at 3pm EST; the new joiner will be added starting tomorrow and will also join today's session.

## Action Items

- [ ] Arne: Send the FanDuel Pages AI platform docs site link and the AI Platform Kanban Jira board link via Slack
- [ ] Arne: Add the new joiner to the team Slack channel
- [ ] Arne: Send Datadog links for the AI Gateway dashboard and the AI cost dashboard
- [ ] Arne: Email Ben Stone to move the new joiner from Flexforce to report under Arne/Jonathan (alongside Imran, Sam, Leo, MK) for faster access approvals
- [ ] Arne: Send today's standup invite (in 25 minutes) to the Zepta email address; Sam to add the new joiner to the recurring series from tomorrow
- [ ] Sam: Continue organizing the AI Platform Kanban board after the migration from John's board
- [ ] New joiner (Zepta consultant): Read through the FanDuel Pages site to get up to speed on architecture, MVP/pilot/production status
- [ ] New joiner (Zepta consultant): Review the Kanban backlog and pull work off it
- [ ] New joiner (Zepta consultant): Take on API key provisioning automation as first workstream
- [ ] Leo: Fix GitHub MCP auth in the gateway to match the OIDC/Okta experience (Arne meeting Leo later today for status)
- [ ] Team: Roll out the AI Gateway to all Claude CLI users tomorrow

## Open Questions

- Metering and billing model: per-individual budgets vs. per-team budgets across Opus/Sonnet/Haiku, and how much accountability to push back to the domains. Ongoing complicated conversations with finance tech.
- How to solve PII/sensitive data handling before broad logging into Databricks.
- How to decommission the security MCP server once parity is reached.
- Whether adding your own API keys in Cursor is cheaper; Cursor traffic still routes through Cursor's backend before reaching the AI Gateway, so support work with Cursor is ongoing.
- Repo ownership, approvers, and teams for the Kong AI Gateway repos still need decoupling from John's team.
- Whether the AWS PPA can push costs down further.
- Confirming FanDuel Pages access for the new joiner (request appears approved by Ben Stone, but access was still failing during the call).
- How to make MCP creation and onboarding a good developer experience end to end.
- The binary split for gateway deployment has only been discussed in principle.

> [!quote]- Full transcript
> [0:01] **Me:** Hi there, how are you doing today, Arnu?
> [0:03] **Arne:** how are you doing today yes it's just freaking token cost it ruins my bloody life i'm telling you
> [0:06] **Me:** Good, how are you?
> [0:13] **Arne:** everybody just wants opus and nothing else i know we blocked out at the org level dear lord
> [0:18] **Me:** Well, at least they're not asking for Fable, you know.
> [0:25] **Arne:** there's just too many security risk like prompts being sent back to anthropic for
> [0:28] **Me:** Well, it's because Anthropic always tells you Opus is what you should use.
> [0:30] **Arne:** model learning and training that is just a no-go but we we do seem to have people levitating and
> [0:38] **Arne:** having a bias towards opus for no reason at all yeah no right we're on 4.8 yeah
> [0:47] **Me:** It's what it defaults to.
> [0:49] **Me:** At least they're not defaulting to Opus 5 just yet.
> [0:52] **Me:** It's just still 4.8? I think 4.8?
> [0:56] **Me:** 4.8? Yeah.
> [0:57] **Arne:** so it becomes absolute nightmare to yeah it's just a nightmare that's why we're building out
> [1:04] **Arne:** the ai gateway we can start getting real creative with semantic routing semantic
> [1:06] **Me:** Absolutely.
> [1:12] **Arne:** caching budgets and billing have you worked in a gateway before yeah
> [1:13] **Me:** It's going to be really cool stuff.
> [1:15] **Me:** I'm excited for this project because it's going to be really cool having those workflows.
> [1:23] **Me:** I mean, I was working with John Kleiner and his team,
> [1:32] **Me:** and so we published the gateways through...
> [1:32] **Arne:** yeah
> [1:32] **Arne:** yeah
> [1:37] **Me:** their engine and everything.
> [1:41] **Me:** So I've worked with gateways there.
> [1:44] **Me:** I've worked with other gateways, not AI specifically.
> [1:44] **Arne:** the same i just slapped the word ai in front of it in any time so yeah so we're
> [1:49] **Me:** So, yeah, yeah, yeah, exactly.
> [1:55] **Me:** I mean, from my understanding, the gateways are mostly so that we can kind of see what logs are coming through,
> [2:03] **Me:** see what models people are using, kind of a lot of analytics on the different models.
> [2:09] **Me:** And what the use cases are and things like that.
> [2:12] **Me:** So I've definitely worked with that kind of data before.
> [2:16] **Arne:** exciting because it's exciting build outs especially like imran and leo is doing as well
> [2:17] **Me:** So, okay.
> [2:23] **Arne:** because we are positioning the gateways with a single egress ingress point for all ai traffic
> [2:29] **Arne:** super ambitious statement but that is what we need to do so we are focusing currently on cloud cli
> [2:37] **Arne:** for a starter
> [2:38] **Arne:** next is claude desktop but we need to switch to claude 3p third party inference so i'm just waiting
> [2:47] **Arne:** for leo to bog out a web search mcp then we can start rolling that out as well but i think
> [2:53] **Arne:** currently the biggest focus for the team is semantic caching semantic routing metering and
> [2:58] **Arne:** billing and mcps we we've got most of the mcps on board but it's a shitey process for the developer
> [3:01] **Me:** Yeah, yeah, yeah, yeah, yeah, yeah, definitely.
> [3:07] **Arne:** to onboard it it is
> [3:08] **Arne:** we're just trying to reach parity with the security mcp server then we need to figure
> [3:14] **Arne:** out how we're actually going to decommission that yoke and just make call the authoritative mcp's
> [3:19] **Arne:** registry gateway as well so a few ambitious plans and kong did announce last week beta version of
> [3:28] **Arne:** running ai gateway separate from the api gateway but something we need to start looking at as well
> [3:34] **Arne:** so we can decouple from john's team we have just too many dependencies back to john's team
> [3:39] **Arne:** we need to break those so there's your to-do list for the next week see you
> [3:45] **Me:** Yeah.
> [3:48] **Arne:** now in all seriousness but um that is sort of genuinely our first highest priorities
> [3:54] **Arne:** we're going after we do have additional projects which i can share with us
> [3:58] **Arne:** with you as well like with the data like integration we won't start logging yeah
> [4:01] **Me:** Okay.
> [4:02] **Me:** Oh, I've definitely done a lot of data lake stuff.
> [4:04] **Me:** It's that was most of my job when I worked over at AWS.
> [4:07] **Arne:** oh excellent because we need to we've had quite a few conversations with the databricks team
> [4:08] **Me:** Oh, really?
> [4:13] **Me:** Yeah.
> [4:14] **Arne:** basically logging pretty much everything into the databricks warehouse so we can start running more
> [4:18] **Me:** Okay.
> [4:20] **Arne:** informed analytics bit of ml ai start creating what flywheel of we see users is doing this how
> [4:28] **Arne:** can we prevent it through governance compliance or just plugins in the ai gateway as well i think
> [4:31] **Me:** Yeah.
> [4:35] **Me:** MCP is.
> [4:37] **Arne:** that
> [4:37] **Arne:** it is a easy piece until you start talking about pii and sensitive data so
> [4:42] **Me:** Yep.
> [4:42] **Arne:** that's one of the next hurdles we need to solve as well i don't think you want to um
> [4:47] **Arne:** start searching hr conversations for arguments like or whatever the ceo is typing away in
> [4:53] **Arne:** claude that might be a bit of a dodgy interesting but very dodgy start let's be honest so that is
> [4:55] **Me:** Yeah.
> [4:58] **Me:** Oh, yeah.
> [5:00] **Arne:** we what we're driving on the ai gateway and which one is the highest priority um we are
> [5:07] **Arne:** rolling out the gateway tomorrow to all clr users we had a few hiccups mostly around mcps and netsk.
> [5:16] **Me:** Okay.
> [5:17] **Arne:** which is we need um whether mcps um will i think yeah i'll add it to the channel so we have get up
> [5:18] **Me:** What were the hiccups?
> [5:26] **Arne:** is the one mcp which is giving leo a bit of headache so if you include desktop and you use the
> [5:33] **Arne:** anthropic get up mcp it just does a
> [5:36] **Arne:** o of oidc to octa and you authenticate it and off you go the implementation we have in the gateway
> [5:44] **Arne:** is that you have to provision yourself a github token save it in a file and then you can use
> [5:48] **Me:** Yeah.
> [5:50] **Arne:** the github mcp that's not good enough it needs to sort of work the same as the oidc one in the
> [5:57] **Arne:** desktop and the free p1 so that is a bit of a it's not bothering too many people what it is if we're
> [6:04] **Arne:** going to replace the security mcp server it's just something we need to fix i know leo was looking
> [6:10] **Arne:** around at moving the course in front of the off but um we have a meeting but later today just to
> [6:16] **Arne:** see how he's getting on as well but next to that most of them are working actually quite pretty
> [6:17] **Me:** Yeah.
> [6:21] **Arne:** well because oh that's the other part the mcp registry and gateway will be the only mcp server
> [6:30] **Arne:** in fandu for enterprise and custom developed mcps
> [6:34] **Arne:** so there's that whole workflow how do we actually make it easy for developers to create the mcp
> [6:42] **Arne:** do some git and just and onboard it into um the ai gateway mcp registry as well but also
> [6:49] **Arne:** the softer side of user experience we're working through as well
> [6:53] **Arne:** yes that was eight minutes and eight months of working just about eight minutes
> [6:58] **Arne:** but tell me what more about yourself you've been in platform engineering
> [7:01] **Me:** Yeah.
> [7:02] **Me:** I was working with John's team to deploy a lot of the API gateways.
> [7:06] **Me:** And we were also deploying some new control planes and data planes so that we could deploy the...
> [7:13] **Me:** ...
> [7:14] **Arne:** so we can get you an email
> [7:14] **Me:** Yeah, yeah, definitely. That would be a really good place to start probably is getting those disconnected from each other because with me doing the API gateway, I know the whole process for FanDuel to deploy those already through Argo and through the GitHub CIC pipeline and everything like that.
> [7:16] **Arne:** um to work on the although it's only beta but how to deploy the
> [7:20] **Arne:** beta ai gateway as a separate release now yeah and both companies
> [7:44] **Me:** But for me, so I've been doing consulting for the last eight years or eight years now. I started at AWS doing consulting with them as a professional services consultant.
> [8:00] **Me:** I've been doing projects, you know, back to back for the last eight years, a bunch of different things.
> [8:07] **Me:** And then about two years ago, I left Amazon and joined Dan's team.
> [8:14] **Me:** Yeah, over here at Zepta. I've been working on a lot of a couple different projects since then.
> [8:20] **Me:** A big one that I was able to work on actually has to do with the data lake stuff was I was able to move, I think it was 800 terabytes over from DynamoDB to S3, actually S3 tables, which is one of their newer services that uses like Apache Iceberg format for their
> [8:42] **Arne:** yeah what happened to the last three percent
> [8:44] **Me:** data storage and everything like that.
> [8:46] **Me:** Saving like 98%.
> [8:49] **Me:** This was like millions of dollars.
> [8:52] **Me:** Yeah, yeah.
> [8:54] **Me:** Well, they have to make their buck somewhere at AWS, right?
> [9:00] **Me:** So I've been doing that.
> [9:01] **Me:** And then the last couple months I've been working with John's team doing the API gateway control planes and data planes and a lot of that work.
> [9:12] **Me:** There was some red tape because.
> [9:13] **Me:** Yeah.
> [9:14] **Me:** With the control planes and the API gateways, they all modify a singular file.
> [9:21] **Me:** So you couldn't just do like a lot of the you couldn't just push PR, PR, PR.
> [9:22] **Arne:** yeah okay sort of our interaction with john with ai gateway as well we are
> [9:29] **Me:** You had to do them sequentially instead of all at the same time.
> [9:32] **Me:** So a lot of the work over there was just getting people to, you know, accept the PR and review them.
> [9:43] **Me:** Because it was, I mean, the changes were like five or six different files and then a couple of test files.
> [9:48] **Me:** But a lot of the time was just going back and forth with some of the developers and getting the approval for the PR and then going back, modifying the file for the next domain.
> [9:59] **Me:** Because we did.
> [10:04] **Me:** Yeah.
> [10:05] **Me:** Yeah.
> [10:07] **Me:** Their team's actually doing some of the Claude API provisioning as well.
> [10:13] **Me:** Or Claude code.
> [10:15] **Me:** It's one of the two.
> [10:17] **Arne:** ai developer
> [10:17] **Me:** Yeah.
> [10:18] **Arne:** yeah we are taking it over um apex uh ai engineering and user experiences
> [10:18] **Me:** Yeah.
> [10:26] **Arne:** is a new team in fandu we formed about five months ago but probably officially about a month
> [10:32] **Arne:** two months ago as well so
> [10:33] **Me:** That's kind of what John was saying is right now it's like the Wild West of AI and everything like that.
> [10:39] **Me:** And we're trying to consolidate, get everything ready for the users.
> [10:43] **Me:** And then the hope is basically once we have everything provisioned in place, people can start migrating over to the new like move out of the Wild West and into our kind of platform and our use cases and everything like that.
> [10:57] **Arne:** yeah
> [10:58] **Me:** So it'll be a little bit of time for everybody to move over.
> [11:02] **Me:** But I think once all of these different pieces are in place, it'll be a lot easier for people to move over and use that.
> [11:11] **Arne:** no especially for automation i think that's going to be kids like the api request it is just a shitty
> [11:11] **Me:** Go ahead.
> [11:12] **Me:** Yeah.
> [11:18] **Arne:** process to be honest it's just a shitty process to be honest it's just a shitty process to be honest
> [11:20] **Arne:** um in today's age where john or anybody still have to go into going to provision api key
> [11:25] **Arne:** sometimes it just boggers my mind we were waiting for our own apex jira boards so people can actually
> [11:27] **Me:** Yeah.
> [11:32] **Arne:** request api keys and if i have the responsible ai or governance approval it should just be
> [11:39] **Arne:** auto provisioned that's the goal we need to go for so that's going to be on the to-do list as
> [11:41] **Me:** Yeah.
> [11:44] **Arne:** well we were sort of slapping it together very quickly just to unblock people and putting out
> [11:49] **Arne:** fires but we need to sort of start taking a step back and productionize this thing so i forgot
> [11:55] **Me:** Definitely.
> [11:58] **Arne:** about the api provisioning thank you but we only got our general board friday afternoon so we need
> [12:00] **Me:** That would be a cool piece of the project that I'd definitely be willing to take on.
> [12:03] **Arne:** to start building out that automation now as well okay yeah yeah yeah i'm gonna put you everywhere
> [12:13] **Me:** I think that automation and provisioning.
> [12:15] **Me:** Yeah.
> [12:16] **Me:** Provisioning is a pretty cool piece that I'd be able to help with as well.
> [12:21] **Me:** So wherever you feel I would slot best, I've done full stack development for the last eight years.
> [12:30] **Me:** So you can put me wherever you need me.
> [12:35] **Arne:** don't worry about that just settle in into what we're doing and then we'll put you but i think
> [12:40] **Arne:** definitely as a priority the api provisioning because that's something john and i are going to do
> [12:43] **Arne:** in just a few minutes but i just wanted to show you one of the things that john has been moaning
> [12:45] **Me:** Yeah.
> [12:47] **Arne:** about for good reason we don't get like a million api requests but the whole i will share this site
> [12:53] **Arne:** which is being built do you have access to fanduel or pages for andrew biff let me send you this link
> [12:58] **Me:** I do.
> [13:03] **Arne:** and i'll just send it in slack okay see if you can access that i've been trying to build out sort
> [13:12] **Arne:** of a panel pages dev site for the work we do in ai platforms
> [13:16] **Arne:** everything in the site is generated to have access to it ah excellent tons of reading in there for
> [13:20] **Me:** Yeah.
> [13:22] **Arne:** you um most of it is just built out of source code and it and just request it i think currently
> [13:27] **Me:** Oh, I need to raise a ticket to use this system.
> [13:29] **Me:** Never mind.
> [13:30] **Me:** I don't have access to this.
> [13:31] **Me:** Yeah.
> [13:34] **Me:** Access with me.
> [13:35] **Arne:** because you're under johnny just might need to approve it but um it will cover the architecture
> [13:37] **Me:** Yeah.
> [13:41] **Arne:** from gateway the initialized platform or touch base all that as well mcp all the endpoints for
> [13:47] **Arne:** cloud endpoints we have metering and billing we're building out hackathon agent core identity
> [13:54] **Arne:** there's a bucket load of stuff to consume in there so i think if you go through the site
> [13:59] **Arne:** should be relatively accurate i build it so take it with a pinch of salt as well
> [14:03] **Arne:** but um it should be relatively accurate it will bring out the speed of where we are what is mvp
> [14:09] **Arne:** pilot what is in production what needs to be done as well and we don't cover everything like the
> [14:13] **Me:** I mean, it'll be kind of as the access comes up because I have GitHub access to a lot of repos.
> [14:15] **Arne:** binary split i think we've just
> [14:17] **Arne:** talked about that in principle and especially with regards to the api mcp automation as a real
> [14:24] **Arne:** bit crappy words to put around it the developer experience around it as well should become quite
> [14:29] **Arne:** a bit of a priority for us and then we're just going to add you to the team channel um i'll
> [14:38] **Arne:** create you do you need any additional access or how are you on access trial and error
> [14:52] **Me:** If there's any specific ones that you think I'll need access to, I can look to see if I have access to it.
> [14:57] **Arne:** something on ai gateway i think as well
> [15:01] **Arne:** primary one yeah you can read nearly any repo within fanduel except if it's a sensitive
> [15:05] **Me:** But it's been interesting because I can see a lot of the repos.
> [15:13] **Me:** Yeah.
> [15:15] **Me:** Cool.
> [15:16] **Arne:** um repo right to any repo is um generally restricted we can sort that out to a few
> [15:21] **Me:** Well, sometimes it'll let me see it on the dashboard for GitHub.
> [15:26] **Me:** And then when I try to click into it, it just won't let me see anything.
> [15:33] **Arne:** arv requests i don't think that should be the end of the world but yeah if you can get access
> [15:38] **Arne:** to fanduel pages which will bring you pretty much up to speed of where we are our architecture
> [15:44] **Arne:** as i said what is in pilot what is mvp what are we building we need to add them all
> [15:49] **Me:** You said Kong AI Gateway was the main?
> [15:50] **Arne:** yeah con dash ai dash gateway then you'll have access to most what we need to have access and
> [15:56] **Me:** Yeah.
> [15:57] **Me:** It looks like I have access to this one.
> [15:59] **Me:** They gave me access to anything that John's team had access to.
> [16:05] **Me:** Right.
> [16:09] **Arne:** we need to start decoupling these repos from john's team as well with regards to owners teams and
> [16:15] **Arne:** approvers i don't think we need all the except if it's a con connect type of thing but we'll figure
> [16:22] **Arne:** that out as well i don't think we should invest too much time on it i would rather think that we
> [16:28] **Arne:** will be new
> [16:29] **Arne:** secret ai gateway deployment binary we do just there from the proper way from day one would be
> [16:35] **Me:** Yeah.
> [16:36] **Arne:** my feeling open for suggestions don't be shy to talk don't have opinions um one last both bloody
> [16:44] **Me:** I mean.
> [16:45] **Me:** I'm going to need to just take a look through those pages and see.
> [16:52] **Me:** Do we have a Kong or do we have a Jira board for like what we're actively working on?
> [16:58] **Me:** What in the Apex?
> [17:02] **Arne:** friday it took six weeks to get up and running uh where is it now um they stole fish issues
> [17:10] **Arne:** we couldn't create in it for some bizarre reason but i don't know we got that
> [17:16] **Arne:** approved now as well so i'll just send it in slack to you as well um hope you have access to it
> [17:26] **Arne:** i think you should um sam is busy working through it getting it all organized now because we just
> [17:29] **Me:** This one.
> [17:30] **Me:** Okay.
> [17:33] **Arne:** moved all our work from john's board into ai platform kanban and now just start working and
> [17:42] **Arne:** sorting through them yeah
> [17:46] **Me:** Yeah.
> [17:49] **Me:** Kong board.
> [17:54] **Me:** Yeah.
> [17:55] **Me:** I can see this board.
> [17:56] **Me:** So I can take a look through that board and see if there's anything I can just pull off
> [18:01] **Me:** of the backlog to do as well.
> [18:05] **Me:** I was just about to ask if we have any standups.
> [18:06] **Arne:** do i think nearly daily quick stand-ups with sam which will get yeah no we do we have for especially
> [18:14] **Arne:** for gateway daily stands up so i'm meeting them in about 20 just after this meeting i'll get sam
> [18:21] **Arne:** to add you to those sessions as well we try to keep it short just we usually have priorities
> [18:26] **Arne:** by monday but when it comes to friday those priorities are upside down left side out depends
> [18:31] **Arne:** what the powers i believe you want so we we are a bit fluid our planning is about two weeks max
> [18:34] **Me:** Yeah.
> [18:35] **Me:** I mean, that makes sense with this kind of stuff.
> [18:38] **Arne:** and that's about it and we have ambitious goals to be honest stage yeah
> [18:47] **Me:** Sometimes it's a moving landscape with a lot of the AI and then it depends on what fires
> [18:54] **Me:** come up within the week as well.
> [18:56] **Me:** So I completely understand that.
> [18:59] **Me:** As long as we have goals to look forward to and we have plans to meet those goals, that's
> [19:04] **Me:** the most important part, I think.
> [19:05] **Arne:** now we we are sort of we should make it probably better documented with regards to like we know
> [19:08] **Me:** Right?
> [19:15] **Arne:** we want to do metering and billing but it is complicated conversations which we currently
> [19:19] **Arne:** have a finance tech for nopes and everybody is
> [19:22] **Arne:** you
> [19:23] **Me:** Well, it'd become, that's what I was going to, is it going to be team by team?
> [19:24] **Arne:** we don't know how we want to do metering and building
> [19:30] **Me:** Is it one full organization?
> [19:32] **Me:** Do we have a tagging system?
> [19:33] **Arne:** per individual or is it a team and you get a open sonnet hyco budget within a team and especially
> [19:35] **Me:** Yeah.
> [19:40] **Me:** I mean, yeah.
> [19:41] **Arne:** where they are currently is if your sonnet budget is rich we just kill sonnet off the team but this
> [19:49] **Me:** I think one of the biggest, I mean, in my opinion, one of the biggest things is just
> [19:49] **Arne:** trying to push as much about accountability of quality token budget management back to
> [19:55] **Arne:** the other domains where we
> [19:58] **Arne:** it's a huge you need to add here to it yeah completely agree
> [20:05] **Me:** collect the data at an individual level, tag them properly.
> [20:09] **Me:** In the data lake.
> [20:11] **Me:** And if you want to query an individual, a team, or the organization, you have the data
> [20:19] **Me:** there that you're able to query whenever you create whatever dashboard you need to.
> [20:24] **Me:** Especially, yeah.
> [20:26] **Me:** So, yeah.
> [20:28] **Arne:** because we can do it currently brilliantly within cloud as an org owner but as we transition
> [20:34] **Arne:** more of the traffic over to the gateway those user profiles or user usage doesn't show up
> [20:40] **Arne:** on the on probably back in because we are rerouting to bedrock so that's why about metering
> [20:41] **Me:** Right.
> [20:46] **Me:** Absolutely.
> [20:48] **Arne:** and billing it's going to be a key piece of delivery because re-routing to bedrock well
> [20:50] **Arne:** it's the real reason why we are moving forward but i think it's going to be something that's
> [20:51] **Arne:** going to be important for all of us so that's why we have to reach out and provide it to
> [20:52] **Arne:** and we need to deliver it in phases. I said to Emerton as well I don't think we
> [20:57] **Arne:** should go for the golden plated solution. Let's just constantly add incremental
> [21:02] **Arne:** value if it's shite variable and we try something else or when the needs change
> [21:06] **Arne:** because it's really hard to figure out what does good look like at this stage
> [21:10] **Arne:** because we're still trying to figure out what we have. Good reminder I can safely
> [21:14] **Me:** That makes sense.
> [21:18] **Me:** I've worked on those dashboards, those kinds of dashboards.
> [21:20] **Me:** I've worked on dashboards before, so that's another thing I'll be able to help out with
> [21:24] **Me:** when we get to there.
> [21:29] **Arne:** presume you have Datadog access. That's another thing I still need to do is
> [21:34] **Me:** I think I do.
> [21:40] **Arne:** create teams in Datadog. So it's a bit of a gateway one which is important. One
> [21:47] **Me:** Datadog or, yeah.
> [21:47] **Arne:** send you a link there for the AI gateway one and the second most or probably the
> [21:50] **Me:** I have, I do have Datadog access.
> [21:54] **Me:** It looks like, did you ever, did you add the, what was it called?
> [22:01] **Arne:** most important one is the AI cost. One because we are spending about 480k a
> [22:08] **Arne:** month on cloud. Yeah we did budget 90k a month so we
> [22:15] **Arne:** not that far off. But I think we've looked at it at one stage but it is
> [22:29] **Me:** The Caveman plugin or hook, by any chance?
> [22:34] **Me:** Have you ever heard of it?
> [22:35] **Me:** Yeah.
> [22:40] **Arne:** really hard to enforce across a even if you use MDM push as well across three
> [22:46] **Arne:** and a half thousand people. And cloud is one aspect of our cost. Cursor is
> [22:52] **Arne:** astronomical as well. So Cursor is going to be next on the list to put on the
> [22:55] **Me:** Yeah.
> [22:58] **Arne:** gateway when we have Codex and ChatGPT and all those yokes as well. So
> [23:03] **Arne:** that's what we really want to invest our turn deep into the to us as the
> [23:06] **Arne:** central point too out for either all of these costs policy l háber because
> [23:11] **Arne:** managing five different developer services at this stage just doesn't
> [23:16] **Arne:** scale. It is really hard. You can add your own third party interference as
> [23:19] **Me:** I'm surprised.
> [23:23] **Me:** No, I'm not really surprised.
> [23:26] **Me:** Because with Cursor, I know you can add your own API keys, and I'm wondering if that's
> [23:35] **Me:** cheaper or not for Anthropic and everything like that.
> [23:39] **Me:** But I don't, yeah.
> [23:44] **Arne:** well. But unlike Cloud CLI which would just route directly to a
> [23:50] **Arne:** gateway into bedrock.
> [23:53] **Me:** Yeah.
> [23:53] **Arne:** cloud 3p at years of the same principle cursor still goes to the cursor back end before cursor
> [24:00] **Arne:** manages back end before it comes back to the ai gateway so we're working with them to see what we
> [24:04] **Me:** It's going to be, I'm interested to see what their response is.
> [24:06] **Arne:** can work around to have better support with cloud like cursor as a third party internet and now we're
> [24:15] **Me:** Because if they do anything that lets us do that, there's vulnerability that we can see
> [24:21] **Me:** what their prompts are to their backend systems.
> [24:26] **Arne:** sucking the euro because they still get paid because we just buy like cursor anthropic
> [24:28] **Me:** Right.
> [24:31] **Arne:** through amazon marketplace but we get second edp discounts because we as a flutter group
> [24:35] **Me:** Nice.
> [24:39] **Arne:** have a contract of idp with aws we get about 27 discount on most aws services so there's there's
> [24:46] **Me:** Yeah.
> [24:47] **Arne:** quite a good saving there and we're working with them to create as ppa personal payment something
> [24:54] **Arne:** you know what's a ppa as well to see if we can push costs further down and something like cursor
> [25:00] **Arne:** did right now we're working with them to create a ppa personal payment something you know what's a ppa as well to see if we can push costs further down and something like cursor did
> [25:01] **Arne:** out there semantic routing version about a week and a half ago but it needs croc
> [25:08] **Me:** Yeah.
> [25:08] **Arne:** the language version of croc that yoke is not going live in this org unfortunately or fortunately
> [25:09] **Me:** Yeah.
> [25:10] **Me:** Yeah.
> [25:15] **Arne:** it was leaking and stealing data and prompts and everything that is just not going to fly for us
> [25:15] **Me:** I, politics outside of it, I just don't trust Grok's platform.
> [25:21] **Arne:** unfortunately there's a i'm going to say there's an x and a mask
> [25:33] **Arne:** connection which doesn't work a woman has a
> [25:35] **Me:** Right.
> [25:35] **Arne:** feeling although i absolutely lost this last don't get me wrong
> [25:36] **Me:** Right.
> [25:39] **Arne:** and then eventually what we're working towards as well is um our own inference models
> [25:44] **Me:** Yeah.
> [25:44] **Arne:** and then hosting them on bedrock and getting them behind the gateway as well or even eventually on
> [25:45] **Me:** Definitely.
> [25:49] **Arne:** people's laptop if they're very small unique ones but first we just have to wrangle all these
> [25:53] **Me:** It would be nice to have a context specific AI model for Vandal, for Flutter, specifically
> [25:55] **Arne:** sheep into a single gateway we are building out a context spine or context mesh we are defining yeah
> [26:08] **Me:** where, yeah, Jonathan had said something.
> [26:15] **Arne:** and we are defining those we're talking quite a lot to operators as well because
> [26:20] **Arne:** it's sort of a difficult problem like in platform engineering we solve
> [26:23] **Arne:** basically aws problems within technology but within ai apex we solve problems across the
> [26:29] **Arne:** entire org from finance to marketing to gcp to sales to high sense to so you can't just we have
> [26:34] **Me:** Right.
> [26:38] **Arne:** to otherwise we have just gone for written agent call on bedrock problem solve doesn't work with
> [26:44] **Arne:** salesforce
> [26:45] **Arne:** so building out our first agent platform foundations called initialize it's also in
> [26:45] **Me:** Right.
> [26:52] **Arne:** the docs in that link i'll send you as well yeah yeah so um it's integrating with call
> [26:55] **Me:** That's the third party companies helping, but yeah.
> [26:58] **Me:** And is that something similar to N8n?
> [27:04] **Arne:** out of a box so you can go from a cloud skill to an agent you can create an agent in a gui or you
> [27:10] **Arne:** can create your agent by code skills in the yogi files in github and not deployed in a register on
> [27:17] **Arne:** the initialize platform uh enterprise oversimplified version yes we are we are we are
> [27:21] **Me:** Or, okay.
> [27:22] **Me:** Okay.
> [27:28] **Me:** That makes sense.
> [27:29] **Me:** Yeah.
> [27:30] **Me:** Yeah.
> [27:31] **Me:** Yeah.
> [27:32] **Me:** Yeah.
> [27:33] **Arne:** starting small because it firstly we don't know what agent is out there we myself and tony was
> [27:38] **Arne:** running a scan over github and found i think for just over two thousand agent just definitions by
> [27:45] **Arne:** file names but it's a problem to solve and how we're spending quite a lot of time with brain trust
> [27:46] **Me:** I was just, yeah, it would be nice to have like a registry system that automates the
> [27:53] **Arne:** we do run brain trust as well as the eval engine but needs to be part of our deployment process
> [27:58] **Arne:** before the agent hits production so we're starting to figure out how do we get that integrated into
> [28:05] **Arne:** the initialized platform and working with octa ai because our agent should have our identity
> [28:12] **Arne:** it was a bit of a issue for us because most of our octa it's like what's your email i don't know i'm
> [28:17] **Arne:** a freaking agent i don't have a email so we can't register you it's like okay but octa is a suite of
> [28:25] **Arne:** products specifically brown around agents are we storing not rolling concepting those as well so
> [28:34] **Arne:** does it integrate with the gateway how do we register agents autonomous yeah that is what
> [28:44] **Me:** process of creating that identity for the agent itself.
> [28:49] **Me:** Okay.
> [28:50] **Arne:** octa ai identity is and then we can assign owner privileges
> [28:52] **Me:** Yeah.
> [28:53] **Me:** Yeah.
> [28:56] **Arne:** you name it to an agent and complete life cycle management around the agent as well
> [28:58] **Me:** Makes sense.
> [29:01] **Arne:** whether it's agent to agent or agent workflows can a speak to b and so forth all those are in progress
> [29:10] **Arne:** in flight as well and then the last but is we all adlc which i don't really care too much i
> [29:17] **Arne:** bought the platform you can run whatever you want on the platform i don't care as long as it works
> [29:22] **Arne:** so the idea should be closer to
> [29:23] **Me:** Yeah.
> [29:26] **Arne:** it but just not enough time in a day to do that as well there's about 20 20 minute rundown of
> [29:31] **Me:** Yeah.
> [29:32] **Me:** Yeah.
> [29:33] **Me:** Yeah.
> [29:35] **Arne:** this loads going on currently it's me imran leo and sam and jonathan joined about a month ago
> [29:44] **Arne:** it nearly feels like he's been here for four years and we are onboarding quite a lot of
> [29:47] **Me:** Yeah.
> [29:50] **Arne:** contractors resources and permanent positions as well because we need to start building out the ai
> [29:56] **Arne:** platforms team
> [29:58] **Me:** Definitely.
> [29:59] **Me:** Well, it sounds like there's a lot of work for us to get done here and I'm excited to
> [30:00] **Arne:** so it's very exciting there's a bucket load of work
> [30:04] **Me:** be here.
> [30:05] **Me:** I'm excited to be here.
> [30:07] **Me:** This is some of my favorite stuff to work on, so it'll be a really good process.
> [30:11] **Me:** It'll be really fun.
> [30:11] **Arne:** anyway which is quite nice it's in because i used to be the director of foundational
> [30:16] **Arne:** infrastructure and platform engineering before i moved over all of this is green fields we
> [30:21] **Arne:** have nothing in platform engineering it was always difficult to make changes because there's
> [30:22] **Me:** Oh, yeah.
> [30:26] **Arne:** 16 legacy systems which is not going to play together we're completely green filled and we can
> [30:33] **Arne:** genuinely
> [30:34] **Arne:** build amazing stuff from scratch which is and we can tear it down afterwards because we don't like
> [30:39] **Arne:** it for shits and giggles if we want to as well so that makes well it's ai our long-term plan is not
> [30:40] **Me:** Absolutely.
> [30:42] **Me:** Hopefully we don't do that, but we can.
> [30:45] **Me:** We can.
> [30:48] **Arne:** longer than six months because then it will be voided or replaced by anything else in any case
> [30:52] **Arne:** so it's fine except the only constant is pretty much your ai gateway so we can move quite fast
> [30:54] **Me:** Yeah.
> [31:00] **Arne:** i think the only thing as i said earlier is we need to get our decoupling from john and platforming
> [31:04] **Arne:** engineering completely out of the way so we can merge and improve prs at our own speed and just
> [31:04] **Me:** Yeah.
> [31:10] **Arne:** keep on adding and delivering value okay a few things get access to that find your pages that
> [31:12] **Me:** Definitely.
> [31:13] **Me:** Cool.
> [31:14] **Me:** Well.
> [31:15] **Me:** Did you have ... I've put that in already, so that should be ... Let me see if I can
> [31:18] **Arne:** will bring you out to speak of quite a lot of stuff i'm gonna ask you then who do you who does
> [31:25] **Arne:** those requests go to do you have any idea otherwise i will get them to move in flex
> [31:30] **Me:** see that.
> [31:31] **Me:** It's already resolved.
> [31:36] **Arne:** not x4 i guess that must be john
> [31:39] **Me:** Looks like it was just an automated Okta process.
> [31:40] **Me:** Oh, no.
> [31:41] **Me:** Ben Stone approved it.
> [31:46] **Arne:** because otherwise i'll just see i'll move you in underneath me from flexforce it's just okay
> [31:51] **Me:** I don't know who that is.
> [31:52] **Me:** I've never met them before.
> [31:53] **Me:** Gotcha.
> [31:54] **Me:** Yeah.
> [31:55] **Me:** That would be good.
> [31:58] **Me:** I'll go through these pages.
> [31:59] **Me:** Do you want to add me ... When is this meeting?
> [32:00] **Me:** Yeah.
> [32:03] **Me:** Yeah.
> [32:04] **Arne:** it's um i'll copy been an email get you to move underneath me under me and jonathan as well
> [32:04] **Me:** Yeah.
> [32:05] **Me:** Yeah.
> [32:11] **Arne:** because like some like mk that is working on the initialized platform he reported to
> [32:18] **Arne:** uh matt taylor svp of product his request took a while to get approved
> [32:25] **Me:** Yeah.
> [32:26] **Me:** Yeah.
> [32:26] **Arne:** yeah so i'll see if i can move get you moved underneath to where imran sam leo and mk as well
> [32:32] **Arne:** but just try to be a bit more nimble um it is daily at 3 p.m est
> [32:34] **Me:** Yeah.
> [32:37] **Me:** Yeah.
> [32:38] **Me:** Yeah.
> [32:39] **Me:** Yeah.
> [32:40] **Me:** Yeah.
> [32:41] **Me:** Yeah.
> [32:42] **Me:** Yeah.
> [32:46] **Me:** When is this meeting, you said?
> [32:47] **Me:** Eastern time.
> [32:48] **Arne:** um but sam usually sends out updated ones constantly as well
> [32:52] **Arne:** so i'll get sam to add you from tomorrow and then you can just
> [32:56] **Me:** Okay.
> [32:57] **Me:** Okay.
> [32:58] **Me:** I can join today's too if you just want to send me the invite.
> [32:59] **Arne:** do that
> [33:01] **Me:** And then I can meet the team, and see what everything ... And it's Monday, so we can
> [33:07] **Me:** kind of divvy up something for ... I'd like to get started working in providing value
> [33:12] **Me:** as soon as possible.
> [33:14] **Me:** So that's my goal here.
> [33:22] **Arne:** left ages ago
> [33:24] **Arne:** um are you like the other receptors should actually use your zeta email or is we find
> [33:35] **Arne:** your email right well this one i'm just going to send it to your final email it is in 25 minutes
> [33:36] **Me:** I would prefer the Zepta email, because then it shows up on my ...
> [33:40] **Me:** Yeah, yeah, yeah.
> [33:41] **Me:** calendar on my computer I don't have to go into it but if you can only do the
> [33:48] **Me:** other one yeah yeah that works sounds good all right thanks Arne
> [33:54] **Arne:** um then i'll see you in 25 minutes so we can see what you can start dishing out into your way
> [33:59] **Arne:** okay nice one cheers
> [34:01] **Me:** Cheers
