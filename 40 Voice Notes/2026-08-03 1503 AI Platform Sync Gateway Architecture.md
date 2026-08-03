---
date: 2026-08-03
time: 15:03
duration: 27m
participants:
  - Others
  - Me
tags:
  - meeting
  - ai-gateway
  - model-endpoints
  - jira
  - cursor
  - architecture
source: note-taker
---

# AI Platform Sync Gateway Architecture

## Summary
Weekly AI platform sync covering in-flight work (Sonnet 5 rollout, Kong dev environments, metering/billing, semantic routing) and a longer architecture discussion about where the AI Gateway should live. The team converged on keeping AI gateway infrastructure in the AI tools account and decoupling from John's Fabric team, with an ADR to be drafted to make the case to Bryce. Side discussions covered Cursor's lack of third-party inference routing, Kimi/open-frontier model evaluation, and whether to start planning for multi-region or GCP.

## Key Points
- **Sonnet 5 rollout**: shipped Friday to live, staging and prod. Open confusion over whether Sonnet 5 *replaced* Sonnet 4.8 — Slack conversation with Leo suggested a straight swap, but 4.8 is still an approved model and both endpoints are needed.
- The agreed pattern is a **single OIDC endpoint** with model selection via a request parameter or header (mirroring the Anthropic endpoint that fronts Haiku/Sonnet/Opus) — not separate endpoints per model. All four models (Sonnet 4.5, 4.8, 5, plus the existing set) must be reachable behind it.
- **Kong dev environments**: John indicated they could be done by the 6th (end of this week).
- **Metering and billing**: complete, in final testing before the last endpoint changes and promotion to prod.
- **Semantic routing**: infrastructure work is done; Leo is running pipelines to test the Cloud Fabric infra. Still in progress.
- **Backlog**: context management Bedrock 400 fix, and discovery/review of the new Kong AI Gateway version.
- **API key provisioning / lifecycle management** should move out of John's Jira now that the team has its own board. Context exists in the FTG AI support channel canvas — requests require a referenced approved responsible-AI ticket before a key is issued. No draft design yet.
- **Jira migration**: initiative created and tickets migrated from the platform space, but Kanban board filtering is opaque — control filters for ticket routing aren't visible. Tweaking still needed; a colleague acting as middleman to the Jira admins can help.
- **Cursor**: third-party inference still routes through Cursor's managed services before reaching the company, and exposing the Kong gateway isn't desirable. Talks with Cursor are ongoing. Stance for new vendors: support third-party inference or we likely don't do business. Counterpoint raised that Cursor has no models of its own so its incentives differ from Anthropic's, making the comparison apples-to-oranges.
- **Cursor commercials**: seat-based licensing with ~700k divided across seats into token budgets; roughly 1,000 seats unused in the last 30 days, to be cleaned up. Contract runs to March next year. If the footprint shrinks enough, dropping support is an option.
- **Harness vs model** argument: harnesses (Cursor, Claude Code) are improving faster than the models themselves, so there's value in keeping multiple harnesses in the ecosystem rather than single-vendor lock-in.
- **Kimi**: notable leap in multi-agent/agent scaling; interesting enough to sandbox. Could run on Bedrock with zero data retention, but a Chinese-origin model raises legal/compliance/regulatory friction. Consensus: sandbox to understand capabilities, not a company-wide release.
- **Braintrust** eval work matters because vendor claims ("better, cheaper, faster") need independent inference-model eval tests.
- **Claude CLI rolls out to all users tomorrow**; hiccups expected, notably the GitHub MCP requiring a token and behaving differently.
- **Gateway architecture**: debate between one AI gateway per domain account vs. all gateways in a single AI tools account with domains routing through it. Current state is a single account everyone routes to. Scaling concerns exist for both AI gateway and Bedrock in a single account. Argo gives visibility into app structure and Kubernetes clusters (as John's team uses it), but isn't strictly required — deployment could go through GitHub directly.
- Organizational argument carried the day: the AI pod should be structurally separate from the existing organization, and "anything with the word AI belongs to Bryce, which belongs to us." Keeping gateways in the AI tools account keeps ownership, visibility and freedom of movement with the team. Dev (the new AI beta), stage and prod slices can live under it.
- **Multi-region / GCP**: judged too early — no decent monitoring yet, and SLIs/uptime are currently John's problem via piggybacking. Raised as a constraint to avoid designing into a corner. A Bedrock us-east-1 outage would be severe now that people depend on the CLI. Suggestion to test Terraform-based cold rebuild time against the SLI rather than paying for a hot standby. GCP is described as "definitely coming." EU expansion complicated by zero official footprint outside US/Canada, differing regulations, and inconsistent model availability.

## Decisions
- Keep one OIDC endpoint with model selection via parameter/header rather than creating new per-model endpoints; all four models must be available behind it.
- Move API key provisioning and lifecycle management automation off John's team's Jira and onto the team's own board.
- Keep AI gateway infrastructure in the AI tools account (team-owned), decoupled from John's Fabric team — pending an ADR and Bryce's buy-in.
- Write a high-level ADR for the gateway/account approach: what the approach is, why, and how it looks at scale. Explicitly not a deep-detail document.
- Multi-region and GCP are out of scope for now, but should be kept in mind as soft constraints so current decisions don't foreclose them.

## Action Items
- [ ] Leo: confirm whether Sonnet 5 replaced Sonnet 4.8 and that endpoints for Sonnet 4.5, 4.8 and 5 all remain available behind the single OIDC endpoint
- [ ] Imran: finish final testing, push remaining endpoint changes and move metering/billing to prod (target: end of day today, tomorrow at the latest)
- [ ] Leo: continue running pipelines to test Cloud Fabric infra for semantic routing
- [ ] John: deliver Kong dev environments by the 6th
- [ ] Me: draft the ADR for the AI gateway account/deployment approach (owner inferred from the discussion — worth confirming)
- [ ] Unclear owner: produce a draft design for the API key provisioning and lifecycle automation flow, using the FTG AI support channel canvas as context
- [ ] Unclear owner (Jira board owner): sync with the Jira middleman contact to resolve Kanban board filtering and ticket routing
- [ ] Unclear owner: clean up the ~1,000 Cursor seats with no login in the last 30 days
- [ ] Unclear owner: continue the conversation with Cursor about third-party inference routing
- [ ] Team: expect and triage issues from tomorrow's Claude CLI rollout, including the GitHub MCP token behaviour

## Open Questions
- Did Sonnet 5 decommission Sonnet 4.8, and are all required model endpoints still live?
- One AI gateway per domain account, or multiple gateways in the single AI tools account with domains routing through it?
- Do we adopt Argo (or our own Argo surface) for provisioning and app sync, or deploy directly via GitHub?
- What is the SLI/recovery-time target, and does a Terraform cold rebuild fit inside it — i.e. is a hot secondary region needed at all?
- Whether to support Cursor (and potentially Claude/ChatGPT tooling) long-term, contingent on third-party inference support and footprint reduction.
- How to force routing through the AI tools stack — assumed to be via API key issuance rather than the API gateway model, but not settled.
- How Kimi could be adopted given compliance posture, even with Bedrock zero-data-retention policies.

## Notes
- "Me" is unavailable all day Wednesday due to prior engagements; available every other day.

> [!quote]- Full transcript
> [0:00] **Others:** let's see um i don't know did we get an update on that yeah it still also actually goes for me
> [0:13] **Others:** oh jesus where's my camera sorry right sorry my camera doesn't work jesus who uses his
> [0:25] **Others:** short google machine earlier today he said that uh he was gonna do discovery and figure
> [0:38] **Others:** out the infra requirements before proceeding with the build um anything else since then
> [0:43] **Others:** no okay gotcha uh sonnet rolled out uh so live and staging in prod yeah i do have a question
> [0:57] **Others:** about that song that i learned we did it friday sonnet five i think we just need a bit of clarity
> [1:02] **Others:** whether sonnet five replaced for uh sonnet four eight because we need both of those endpoints
> [1:09] **Others:** available that's a question for leo because it probably
> [1:15] **Others:** sounds like in the slack conversation i had with him it sounded like he just replaced
> [1:20] **Others:** sonnet 4 8 with sonnet 5 of sonnet 4 6 sonnet 4 8 with sonnet 5 and they must still be we call
> [1:28] **Others:** solid 480 still approved model as well so there must be an endpoint for solid 4 8 and an endpoint
> [1:34] **Others:** for sonnet 4 5. four endpoints then for multi oidc so i know we instead of uh creating new endpoints
> [1:43] **Others:** we want to keep the same endpoint but
> [1:45] **Others:** but allow selecting allow for people to select different models i mean we've moved to
> [1:51] **Others:** instead of creating yeah so four eight and five is above available behind i i believe so i mean
> [1:58] **Others:** i'm not 100 sure i cannot confirm but you know we we move that's another one i want all four models
> [2:05] **Others:** available how we do it that's your choice right i mean i thought we'd we had made that decision
> [2:11] **Others:** a while back just to keep one endpoint and just allow people to select it in the parameter
> [2:15] **Others:** in the output泡1 and like as a header or something no completely agreed because we have
> [2:22] **Others:** the anthropic endpoint which supports the heiko sonnet and opus it was just it sounded like it
> [2:29] **Others:** basically de-commissions understood eight and i replaced it with five yeah that's that's the
> [2:37] **Others:** clarification i just need so the single oidc endpoint just needs the four endpoints behind it
> [2:43] **Others:** though that's completely correct
> [2:51] **Others:** We just need confirmation around that.
> [2:54] **Others:** OK.
> [3:00] **Others:** All right.
> [3:02] **Others:** Kong dev environments.
> [3:04] **Others:** John said that they could likely have that done by the 6th,
> [3:08] **Others:** so end of this week, which would save something
> [3:14] **Others:** that we've needed.
> [3:17] **Others:** Metering and billing.
> [3:19] **Others:** Imran, you want to provide any updates there?
> [3:21] **Others:** Yeah, I am done.
> [3:22] **Others:** I'm just doing some final testing
> [3:24] **Others:** before I push the last changes to all the endpoints,
> [3:27] **Others:** and also moving things to prod.
> [3:34] **Others:** Hoping to finish it by the end of the day today or by tomorrow
> [3:37] **Others:** at max.
> [3:48] **Others:** OK.
> [3:54] **Others:** Semantic routing.
> [3:56] **Others:** The update there is, do you recall what Leah said
> [4:12] **Others:** this morning, Imran?
> [4:13] **Others:** Sorry, I'm looking through my notes trying to find it.
> [4:15] **Others:** Yeah, I believe all the infrastructure stuff
> [4:22] **Others:** is done from what I understand.
> [4:25] **Others:** And Leo is making progress.
> [4:30] **Others:** The ball is in his court.
> [4:31] **Others:** I don't know how far he got to it.
> [4:33] **Others:** Yeah.
> [4:35] **Others:** Yeah.
> [4:35] **Others:** Sorry, I just found it.
> [4:37] **Others:** He's running the pipelines to test Cloud Fabric Infra
> [4:42] **Others:** for semantic routing.
> [4:44] **Others:** OK.
> [4:44] **Others:** OK.
> [4:45] **Others:** So he's working on that.
> [4:46] **Others:** So it's still in progress.
> [4:50] **Others:** We still have in the backlog, we've
> [4:53] **Others:** got the context management Bedrock 400 fix.
> [4:55] **Others:** We've got the new Kong AI Gateway version,
> [5:00] **Others:** just doing discovery and reviewing that new version.
> [5:06] **Others:** And then I think as we spoke on Slack
> [5:08] **Others:** and then I was speaking to Michael as well,
> [5:10] **Others:** is now that we have our own Jira board,
> [5:12] **Others:** I think we need to get that API key previewing.
> [5:14] **Others:** I think we need to get that API key provisioning automation
> [5:16] **Others:** lifecycle management out of John's world.
> [5:19] **Others:** I know it's not a huge amount of burden,
> [5:21] **Others:** but it would be just a good thing to get it completed
> [5:26] **Others:** and put it in, polished and out of the way.
> [5:30] **Others:** Thoughts?
> [5:32] **Others:** No, totally agree.
> [5:34] **Others:** That's a long time coming.
> [5:36] **Others:** Just get it out of there, out of there, out of their Jira.
> [5:41] **Others:** Yeah.
> [5:41] **Others:** Yeah.
> [5:42] **Others:** Yeah.
> [5:42] **Others:** Yeah.
> [5:43] **Others:** Yeah.
> [5:43] **Others:** Yeah.
> [5:44] **Others:** Yeah.
> [5:44] **Others:** And that setup is still in progress, Arno, on the Jira boards.
> [5:49] **Others:** I've got the initiative set up.
> [5:51] **Others:** I've got all of the tickets migrated over from the platform space.
> [6:00] **Others:** What I'm running into is that the filtering system
> [6:07] **Others:** for the different Kanban boards is interesting
> [6:11] **Others:** because I'm not able to actually see some of the control filters.
> [6:13] **Others:** For how things are being pipelined or how some of the tickets are being routed.
> [6:20] **Others:** I get everything being on the Apex board, but yeah,
> [6:26] **Others:** the filtering system is a little interesting.
> [6:28] **Others:** So I think we still have some tweaking to do.
> [6:30] **Others:** No, that's fine.
> [6:31] **Others:** I've just .
> [6:35] **Others:** Perfect.
> [6:35] **Others:** She's been helping us with getting the Jira up and running
> [6:38] **Others:** and getting us the units and block and figuring out how does it work.
> [6:42] **Others:** Yeah.
> [6:43] **Others:** She is a middleman to whoever does the Jira work, but she can help you.
> [6:50] **Others:** Awesome.
> [6:50] **Others:** I will sync with her and get that set up.
> [6:54] **Others:** For the API key Jira provisioning flow that we want to set up,
> [7:02] **Others:** what are first steps here?
> [7:05] **Others:** Do we have a draft of how we want this to look?
> [7:10] **Others:** That's to come up with how it should
> [7:12] **Others:** be working.
> [7:13] **Others:** OK.
> [7:13] **Others:** No pressure there.
> [7:14] **Others:** Yeah.
> [7:15] **Others:** One of the things to remember there is people can request an API key.
> [7:16] **Others:** If you look at the FTG AI support channel,
> [7:17] **Others:** there's a canvas with regards to how to request API keys.
> [7:18] **Others:** So you have to have approved responsible AI or what's the other one?
> [7:19] **Others:** I can't remember.
> [7:20] **Others:** Ticket, which you need to reference before we can print your API key.
> [7:21] **Others:** There's a bit of context in there that might help you.
> [7:22] **Others:** Yeah.
> [7:23] **Others:** Yeah.
> [7:24] **Others:** Yeah.
> [7:25] **Others:** Yeah.
> [7:26] **Others:** Yeah.
> [7:27] **Others:** Yeah.
> [7:28] **Others:** Yeah.
> [7:29] **Others:** Yeah.
> [7:30] **Others:** Yeah.
> [7:31] **Others:** Yeah.
> [7:32] **Others:** Yeah.
> [7:33] **Others:** Yeah.
> [7:34] **Others:** Yeah.
> [7:35] **Others:** Yeah.
> [7:36] **Others:** Yeah.
> [7:37] **Others:** Yeah.
> [7:38] **Others:** Yeah.
> [7:39] **Others:** Yeah.
> [7:40] **Others:** Yeah.
> [7:41] **Others:** Yeah.
> [7:42] **Others:** Yeah.
> [7:43] **Others:** Yeah.
> [7:44] **Others:** Yeah.
> [7:45] **Others:** Yeah.
> [7:49] **Others:** Yeah.
> [7:50] **Others:** Yeah.
> [7:51] **Others:** Yeah.
> [7:52] **Others:** Yeah.
> [7:53] **Others:** Yeah.
> [7:54] **Others:** Yeah.
> [7:55] **Others:** Yeah.
> [7:56] **Others:** Yeah.
> [7:57] **Others:** Yeah.
> [7:58] **Others:** Yeah.
> [7:59] **Others:** Yeah.
> [8:00] **Others:** Yeah.
> [8:01] **Others:** Yeah.
> [8:02] **Others:** Yeah.
> [8:03] **Others:** Yeah.
> [8:04] **Others:** Yeah.
> [8:05] **Others:** Yeah.
> [8:06] **Others:** Yeah.
> [8:07] **Others:** Yeah.
> [8:08] **Others:** Yeah.
> [8:09] **Others:** Yeah.
> [8:10] **Others:** Yeah.
> [8:11] **Others:** Yeah.
> [8:12] **Others:** Yeah.
> [8:13] **Others:** Yeah.
> [8:14] **Others:** Yeah.
> [8:15] **Others:** Yeah.
> [8:16] **Others:** me on the weekend as well the one problem we see with cursor third party inference routing
> [8:21] **Others:** it still goes to their managed services before it comes back to us i don't think we want to expose
> [8:27] **Others:** our call gateway we are engaged in talking to cursor how to get around it um but yeah i think
> [8:34] **Others:** it's just that we know they had token money making business for them so if i can't support third
> [8:39] **Others:** party interference models they are not probably a platform we want to support moving forward
> [8:45] **Others:** is the general stance we're taking for any new vendor
> [8:49] **Others:** gotcha yeah i know the only the only thing uh i would say is slightly different from let's say um
> [8:57] **Others:** um um um cloud code even if even if anthropic doesn't sit in the middle
> [9:06] **Others:** like they have this incentive to get more tokens consumed uh through let's say aws
> [9:14] **Others:** cursor
> [9:15] **Others:** doesn't have that the cushion doesn't have its own models their only thing is to get it consumed
> [9:20] **Others:** through them so slightly different mindset unless eventually drop takes over so i'm just thinking
> [9:26] **Others:** that it you know it's slightly comparing oranges to apples oh completely yeah but our ask is easy
> [9:34] **Others:** for them you should support third party interference or we might not be doing business with you
> [9:41] **Others:** yes they just like how do they make money though right i mean because they don't make money from the
> [9:46] **Others:** front-end tool just like cloud code doesn't it so i'm just saying it's it's kind of hard yeah
> [9:52] **Others:** the licensing is different completely different in comparison like with cloud where we pay a fixed
> [9:57] **Others:** amount we buy about several k a year which is then user seats licensing and then the 700k gets
> [10:04] **Others:** divided about equally against the user seats and we get token budgets so there's about a thousand
> [10:11] **Others:** unused seats currently in cursor which haven't logged in every last 30 days we're going to clean
> [10:16] **Others:** that up as well and if we can reduce the footprint of cursor enough we might just make a decision
> [10:23] **Others:** that we're not going to support cloud and chpd potentially which is fine i'm just basically you
> [10:31] **Others:** know playing from the other side um i i i'm of the opinion that these heart this is basically
> [10:39] **Others:** harness right cursor and cloud code their harnesses and then their different models
> [10:44] **Others:** harnesses the improvement of
> [10:46] **Others:** harnesses is very independent of the model's improvement so i i think there is some value
> [10:53] **Others:** if not for now six months down the road in keeping multiple harnesses in the ecosystem
> [10:59] **Others:** as opposed to relying on a single harness uh there's pros and cons of going with a single
> [11:04] **Others:** vendor and we'll probably never want to go with a single vendor our cursor contract is still march
> [11:09] **Others:** next year so we've got time to play around and see what we can potentially do um or not do or
> [11:16] **Others:** if we can't do it just that is just a decision we we stick to for good reasons as well we haven't
> [11:21] **Others:** made any decisions but we do want all our tools like brain trust coming through third-party
> [11:28] **Others:** interference everybody supports third-party inference and it is quite key because what
> [11:33] **Others:** we see is quite a lot of if my cloud budget is done i'm just going to use cursor and carry on
> [11:40] **Others:** again yeah yeah the the only reason i'm saying this is because models have gotten to a point where the
> [11:46] **Others:** a lot of hangover like even the labs themselves are not utilizing the power of the models
> [11:51] **Others:** it's actually it's actually the harness that's that's improving a lot more not quickly a lot
> [11:56] **Others:** more quickly now and um and it's like it's i think and and the the landscape could change completely
> [12:09] **Others:** shift from this point on because the model is now to a point we're going to run kimmy in two months
> [12:16] **Others:** yeah give me kimmy is like a whole different ball game at this point i mean kimmy is yes i'm
> [12:20] **Others:** actually started playing around with kimmy the biggest thing there is they have just taken kind
> [12:26] **Others:** of a uh their leap frog in terms of multiple agents like yeah yeah agent scaling um so this
> [12:33] **Others:** is what i'm saying like we have yeah we have got a chinese flag which doesn't help us much
> [12:44] **Others:** it it could potentially run on
> [12:46] **Others:** it could potentially run on internal that runs on bedrock but there is as soon as you say kim
> [12:53] **Others:** kimmy internal audit and compliance i just don't understand it completely and if we apply
> [13:01] **Others:** m0 data retention policies on bedrock it we can safely secure it but it is just a bit of a mind
> [13:08] **Others:** shift for like legal compliance regulatory and and that's understandable so i think it's
> [13:15] **Others:** it that's it's it's one thing to just have it in the mix to understand what the capabilities are
> [13:22] **Others:** where the open frontier is getting like in kind of a sandbox environment versus releasing it to
> [13:28] **Others:** the entire company and start exposing data oh no completely agree and that's why we're working
> [13:32] **Others:** quite a lot of brain trust because we need to start building those inference model eval tests
> [13:38] **Others:** because even if we get sonnet 5.1 the marketing is always it's better it's cheaper it's faster but is
> [13:49] **Others:** it's a bit of a challenge to do that so okay but yeah but i think once we've still got a bit of
> [13:57] **Others:** headroom to go before to sort out claude which is our biggest service now we are rolling out
> [14:03] **Others:** a claude cli to all users tomorrow so i expect a bit of hiccups here and there like from nathan
> [14:11] **Others:** more of the github mcp that requires the token which does and olio is working on this as well
> [14:16] **Others:** which requires the token and doesn't work like the same way
> [14:19] **Others:** works they stop and then yeah as to the chatting as well michael i think it will be good to get
> [14:32] **Others:** involved into the ai binary split okay to a binary split on how can we get because i mean you deploy
> [14:39] **Others:** you can api gateways and control planes constantly i want my own what does our good do what does
> [14:46] **Me:** Yeah, I was looking into that a little bit already.
> [14:50] **Me:** And I guess a quick question is, do we want to use Argo?
> [14:55] **Me:** Or do we want our own Argo surface or anything
> [15:01] **Me:** like that for provisioning into having the syncs of the apps
> [15:07] **Me:** and everything, how John's team uses it?
> [15:10] **Me:** I don't even think we need to use Argo
> [15:11] **Me:** if we don't really want to, because we can just
> [15:13] **Me:** deploy it ourselves through GitHub.
> [15:16] **Me:** But Argo kind of gives us visibility into the application
> [15:20] **Others:** our go give us and yeah currently we deploy our gateway to a single account everybody roots for it
> [15:29] **Me:** structure, how applications are deployed.
> [15:33] **Me:** And it also gives you a visual into the Kubernetes clusters.
> [15:39] **Me:** So if we are deploying, I don't know
> [15:41] **Me:** if we're deploying the AI gateways into each domain
> [15:47] **Me:** separately, and then connecting them to data routers
> [15:52] **Me:** and storing the data in Redis, or if we're deploying one AI
> [15:58] **Me:** gateway that all of the domains have to go through
> [16:02] **Me:** and storing it that way.
> [16:05] **Me:** So if we're doing the earlier, then Argo kind of
> [16:09] **Me:** helps us sort between all of the different applications that
> [16:14] **Me:** are routed to each of the domains.
> [16:16] **Me:** Yeah.
> [16:17] **Me:** If we're doing the latter, then we probably
> [16:19] **Me:** want to create our own mechanism for this kind of a thing.
> [16:28] **Me:** Yeah.
> [16:30] **Others:** loads of conversations we don't know how big this thing is going to get and we'll potentially
> [16:34] **Others:** with a high probability adopt the api model api gateway model because
> [16:42] **Others:** i think we can in the future run into either ai gateway scaling or bedrock scaling problems
> [16:49] **Others:** running in a single account so i think if you think about the latter not saying we're going to
> [16:51] **Me:** Yeah.
> [16:55] **Others:** do it but i think we should plan to do it potentially
> [17:00] **Me:** Yeah, so the way that we did it for the API gateway
> [17:01] **Others:** because sooner or later we're going to deploy ai gateway to gcp cloud as well
> [17:11] **Me:** was we just deployed it one per domain,
> [17:14] **Me:** and then the domain routes in through that API gateway.
> [17:15] **Others:** yeah yeah i don't think we're there yet
> [17:21] **Others:** i i don't know if we're going to get there but i get the feeling we're going to get there okay yeah
> [17:26] **Me:** Yeah.
> [17:27] **Me:** I mean, there's a couple of different ways
> [17:30] **Me:** to scale, right?
> [17:31] **Me:** So we could scale that way.
> [17:33] **Me:** Or we could have multiple AI gateways in a single account
> [17:39] **Me:** that we could even run the domains just
> [17:43] **Me:** through the single account, but have an AI gateway per account
> [17:48] **Me:** in the AI account.
> [17:51] **Me:** So that's another way we could structure it, too.
> [17:54] **Me:** It just depends on what do we want to have to go?
> [18:00] **Me:** Yeah.
> [18:01] **Me:** Yeah.
> [18:01] **Me:** Yeah.
> [18:02] **Me:** Yeah.
> [18:02] **Me:** So the question is, are we going to be able to go into each account
> [18:08] **Me:** and manipulate the AI gateway per domain,
> [18:13] **Me:** or do we want to be able to go into?
> [18:16] **Me:** Because it's our team that owns all of the AI gateways.
> [18:20] **Me:** So if we had them all in the single account
> [18:23] **Me:** and then route each domain through our account,
> [18:26] **Me:** it would probably make a little bit more sense
> [18:28] **Me:** because then we have visibility.
> [18:30] **Me:** And they don't even have to worry about it.
> [18:31] **Me:** visibility if they were all in the separate accounts because that's that's
> [18:37] **Me:** what it kind of it's a really good tool to see how apps are deployed that way
> [18:40] **Others:** yeah i'll ask you what you think now imran i do think because we're still running a pete
> [18:42] **Me:** and that's what the that's what John's team uses for for that kind of
> [18:48] **Me:** visibility I think it makes sense to keep it in the AI tools account and keep
> [18:56] **Others:** our version and we want to decouple from john's fabric team completely should we try to keep it
> [19:03] **Others:** simple for a start yeah i don't know my my take on this given there's this because we are in the
> [19:10] **Others:** ai pod right and more than the technology what's needed for the future is organizational change
> [19:18] **Others:** if you are if we are basically in entangled with the existing interest or existing organization
> [19:26] **Others:** we are basically limited by them like you know however then so this is an opportunity
> [19:33] **Others:** i mean i think it's a call that you and jonathan or bryce have to make
> [19:38] **Others:** i personally my take on this is that organizationally the ai technology should
> [19:45] **Others:** also be separate like from an organization perspective also also be separated yeah
> [19:51] **Others:** so but that does that imply we keep it in ai tools
> [19:56] **Others:** tools i think that's the conversation i have anything with the word ai belongs to bryce
> [20:03] **Others:** which belongs to us that is agreed as a construct i think yeah yeah we already have a we're
> [20:10] **Me:** everything under that single account because then you know your team owns it
> [20:15] **Me:** it's in your account everybody routes through what you own and that's what
> [20:20] **Me:** I've seen with a lot of different AWS customers is that organizationally if
> [20:26] **Me:** you own a product then you have have it in your account whether it's you can
> [20:33] **Me:** have four accounts under your team where it's sandbox dev right but having it
> [20:40] **Others:** rolling out dev dev is the new ai beta and we have stage and broad we can have as many
> [20:45] **Others:** slices of non-prod as we want it cleanly separates from the existing organization so not only
> [20:49] **Me:** under your account keeps it in your wheelhouse unless you need to
> [20:55] **Me:** have like a shared account I've seen that before but in this case I think
> [21:00] **Me:** since we own the products having it in our account makes sense yeah yeah make
> [21:11] **Others:** that we can move in a different way from a technology management perspective but also
> [21:16] **Others:** you know it gives you the opportunity to change the organizational structure as well in the
> [21:20] **Others:** ai under the ai umbrella yeah okay it sounds like we all agree it sounds like we're gonna
> [21:27] **Others:** get an adr for this yep we can do that excellent a draft one don't go into the 10th level of
> [21:41] **Others:** details just um i think we should try to cover the approach
> [21:46] **Others:** the approach the approach the approach the approach the approach the approach the approach
> [21:46] **Others:** the approach the approach the approach the approach the approach the approach the approach
> [21:46] **Others:** why we want to do this approach and how it would look like on scale
> [21:52] **Others:** i would say high level because ultimately it's our decision we just need to convince price
> [21:58] **Others:** when it's for our decision all right uh i know it's early days but it's such an interesting
> [22:01] **Me:** sense even even talking about that the AI gateways would need redundancy as
> [22:13] **Others:** conversation do we want to start thinking about multi-region availability i know there's so many
> [22:20] **Others:** fine prints if an agent is not on the second cloud it's just not going to work but
> [22:25] **Others:** and all of that but especially with a gateway from a call it cloud cli desktop perspective
> [22:30] **Others:** if bedrock in east one goes shite it's probably going to be a bit of a big outage for people
> [22:37] **Others:** people can't do nothing without cli or code anymore yeah no that's why i opened this
> [22:47] **Me:** well to a secondary now I think it depends on what the what's the acronym
> [22:51] **Others:** kind of one i think we're too early for it because what i want to be really about you
> [22:55] **Others:** let you let you think about it if we make decisions now just take some stuff into
> [23:00] **Others:** consideration that we don't back ourselves completely into a corner over the next six
> [23:05] **Others:** 12 months at this stage we don't even have decent monitoring and you want to ask for
> [23:12] **Me:** SS what what what is the time
> [23:16] **Me:** to get back up is yeah well that the SLI is a big deal when we're talking about
> [23:21] **Others:** sli's uptime and availability well currently it's john's problem because we piggyback off him
> [23:27] **Me:** redundancy like this because you could do a test to see yeah yeah but we could
> [23:36] **Me:** do a test to see you know if we're starting a terraform script from scratch
> [23:42] **Me:** to spin up all the resources how long does that take does that fall in the SLI
> [23:47] **Me:** and if it does
> [23:48] **Me:** then we don't need a hot backup we can just have a Terraform scripts spin up and
> [23:52] **Others:** yeah i don't know completely agree these options i don't think we want to run hi across two regions
> [23:54] **Me:** reroute those endpoints right right well according to the US apparently fable is
> [24:02] **Others:** i just like take it into consideration when we start thinking but we want to run something
> [24:07] **Others:** a ai tool in the ai account but potentially in the future either we're going to branch to gcp
> [24:15] **Others:** which is definitely coming or multi-region that's the fluffy constraints without any
> [24:22] **Others:** factual data around it even from access point of view i know we have a team big team in the uk
> [24:29] **Others:** that's using it uh and then north america so even from that perspective
> [24:33] **Others:** latency perspective across the pond it might make sense to have a multi-region
> [24:39] **Others:** then we go into different regulations oh i see a fan deal perspective because like
> [24:45] **Others:** periparabit fair always yolks are in eu east or eu west one ireland we have officially zero
> [24:54] **Others:** footprint outside the u.s and canada and but yeah it's not as straightforward as just popping it in
> [25:03] **Others:** another
> [25:03] **Others:** region and to make lives of developers easier especially with regards to conversations we're
> [25:09] **Others:** having about not all inference models might be available or we want to make them or can
> [25:15] **Others:** make them available in the eu that sounds like a nightmare to manage let users have latency
> [25:25] **Me:** not a bit allowed to be used there so crazy times I think the biggest question
> [25:28] **Others:** yeah indeed yeah it's crazy times it's interesting times but yeah i think if we can get some sort of
> [25:40] **Others:** scope id offices probably belong with hld of how do we end the couple from john and deploy this new
> [25:47] **Others:** beta and start in deaf but you can then eventually scale up and what does the möglich look like
> [25:53] **Others:** because there's loads of funky stuff in the new beta the same but different much routing yeah
> [26:02] **Me:** there is how do we force the routing through the AI tools routing into into
> [26:12] **Me:** our into our toolbox I guess that's that's what the API keys and stuff like
> [26:17] **Me:** that but never mind it was I was thinking the API gateway and that's a
> [26:24] **Me:** very different story because then it's like how do you force them to use your
> [26:28] **Me:** API endpoint and with AI it's a little bit different because it's routing using
> [26:35] **Me:** the API key and things like that so it's it's a different story and I was
> [26:39] **Me:** thinking a different thing it's never mind
> [26:41] **Others:** no you're all grand yeah
> [26:41] **Me:** yeah
> [26:43] **Others:** michael sorry that's a good point though you know i think as you start to watch i know there's � об
> [26:44] **Others:** about and i think you know it kind of true that you i know me i will say like mainly like a lot
> [26:45] **Others:** that there's a lot of things uh especially during the upcoming six months
> [26:46] **Others:** during the coming six months there's a lot of known things like um growth the transition
> [26:47] **Others:** from artificial intelligence which is a huge challenge for our就會 Harland so you got a score
> [26:47] **Others:** to prove to комmer Ashe the build we come back to the soonest company to do so and i would also
> [26:47] **Others:** i think as you start to work on it as arno said creating a adr and just kind of having some
> [26:53] **Others:** diagram for for mental map to build a mental map for everyone that would be really helpful right so
> [26:58] **Others:** we could we could see it at a different at different layers because i don't think we'll
> [27:02] **Me:** yeah um real quick just to let the team know I will be unavailable on Wednesday
> [27:03] **Others:** be impacted if we want to for absolutely a bizarre reason use the kong gateway feature of wrapping
> [27:09] **Others:** mcp around the api but hey in this place you'll never know what people want to do
> [27:15] **Others:** good chat i need to drop for another meeting
> [27:27] **Others:** yeah okay sounds good yep no problem at all have a good one everyone thank you
> [27:31] **Me:** I have prior engagements that are gonna last the whole day so unfortunately I'm
> [27:36] **Me:** not gonna be available that day but every other day I'm still here so just
> [27:41] **Me:** wanted to let you guys know yeah thank you
