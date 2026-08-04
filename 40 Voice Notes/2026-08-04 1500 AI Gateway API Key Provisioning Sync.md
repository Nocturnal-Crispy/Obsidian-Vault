---
date: 2026-08-04
time: 15:00
duration: 17m
participants:
  - Others
  - Me
tags:
  - meeting
  - ai-gateway
  - api-keys
  - kong
  - okta
  - observability
source: note-taker
---

# AI Gateway API Key Provisioning Sync

## Summary
Weekly AI platform sync covering new tickets, the state of the Claude/Anthropic API key provisioning process, and progress on semantic routing, MCP observability, and metering/billing. The main outcome was a scope correction: Michael had been architecting Okta SSO for Claude Code and Claude Desktop via managed-settings.json, but the actual work item is automating Anthropic API key provisioning through Kong/ARB. The team also confirmed 100% of Claude CLI traffic is now routed through Kong following this morning's MDM config push.

## Key Points
- New tickets raised: SCIM provisioning for Claude Desktop/Code, MDM config to force AI Gateway routing (already done), API key provisioning productionization, and Kong AI Gateway HA scaling. The last two are assigned to Michael.
- The MDM config forcing AI Gateway routing was pushed around 10am today and now applies to all Claude CLI users; 100% of CLI traffic goes through Kong. Two tracking issues exist, but neither is a gateway issue.
- Scope clarification: the work is the Claude API provisioning (API keys printed in Kong), not Claude Code/Desktop client SSO. That process currently sits in John's world.
- Current process is clunky: user needs an approved responsible AI / AI governance ticket approved by Lorianne, then requests an Anthropic API key via the service desk, routed through ARB, then a semi-manual Kong automation prints the key. A Terraform Kong pipeline creates the consumer bound to the gateway service, with separate keys for prod and stage. Keys are currently distributed via 1Password.
- Two distinct requirements were called out: user API keys (can go through Okta auth) and agent API keys (agents have no identity and cannot complete an Okta auth, so they likely just need a valid API key). Work with Okta AI on an agent identity platform is underway; Imran and Leo previously did work on agents registering with Kong via a separate tenant, bypassing OIDC.
- Semantic routing infrastructure is in progress but blocked on how secrets are stored in AWS Secrets Manager; being worked through with Nathan from Cloud Fabric.
- A first version of MCP observability is live on the stage environment, with metric queries and dashboards being explored. Some traffic and values are already visible.
- Postman MCP config request came from Craig Rezloski; approved config examples were shared by Imran, but Craig followed up asking to hold off because the MCP server requires tool response restrictions.
- Metering and billing is close to done, with Imran doing final checks.
- Zoom access/scheduling problems continue for at least one participant; video was not working at the start of the call.

## Decisions
- Michael's focus is API key provisioning automation, not Claude Code/Desktop SSO deployment.
- Between Michael's two tickets, API key provisioning is the higher priority over Kong AI Gateway HA scaling.
- A new ARB access request board specific to Anthropic will be created, tied to the team's Jira, so approvals happen on their side and stage/production keys are printed automatically on approval. Goal is to make the process as human-less as possible.
- Postman MCP config is on hold and moved to the backlog pending tool response restrictions.
- Current priority order is user experience, semantic routing, and metering/billing; MCP work is explicitly deprioritized.

## Action Items
- [ ] Michael: Revisit the architecture for API key provisioning automation (ARB/Kong flow) rather than the Claude Code/Desktop SSO approach.
- [ ] Meeting lead (name unclear) and Sam: Create a new Anthropic-specific ARB access request board tied to their Jira, and move ARB Jira requests over to their side.
- [ ] Arno: Post the tracking issue details in the team channel.
- [ ] Arno: Continue semantic routing infrastructure work, resolving AWS Secrets Manager storage with Nathan from Cloud Fabric.
- [ ] Arno: Continue MCP observability metric queries and share dashboards once ready.
- [ ] Leo: Provide an update on the Sonnet 5 endpoint sync ticket (no progress yet).
- [ ] Owner unclear: Inspect the Kong data plane manually for the Prometheus plugin, then retrofit the configuration into code.
- [ ] Meeting lead (name unclear): Follow up with John on the Kong dev environment to confirm they are still on target for 8/6.
- [ ] Imran: Complete final checks on metering and billing.
- [ ] Meeting lead (name unclear): Add Michael to the FTG AI support channel and resolve the pending admin approval on the AI platforms invite.

## Open Questions
- Should API access be auto-approved for users who already hold the Claude Code/Claude Desktop role, or should it remain a separate approval process?
- How should agents without an identity obtain and use API keys before the Okta agent identity platform exists?
- What tool response restrictions does the Postman MCP server require before its config can be added?

> [!quote]- Full transcript
> [0:00] **Others:** i'm doing well it is tuesday and it uh it's going um you're you're out starting tomorrow right
> [0:02] **Me:** I am only out tomorrow
> [0:16] **Others:** gotcha whoa how are you doing everyone hello why can't i see anybody's faces including myself
> [0:18] **Me:** I have a meeting that's been
> [0:24] **Me:** it's a 11
> [0:27] **Me:** 11am to 8.30pm
> [0:30] **Me:** meeting so
> [0:30] **Me:** hey Arnu
> [0:37] **Me:** I don't know
> [0:40] **Others:** okay i'm there still can't see you lads we should really get you a zoom account sam
> [0:45] **Me:** sounds like you just didn't want to see us
> [0:52] **Me:** you might have to go out
> [1:00] **Me:** and rejoin to see it
> [1:01] **Me:** it could be just something with the app itself
> [1:03] **Me:** well I got
> [1:08] **Others:** i do have one i just can't schedule anyone why it won't permit me to to actually schedule
> [1:16] **Others:** anything we got the zoom access it just was not permitting me to yeah it was a lot of configuring
> [1:24] **Others:** for uh very little result um i know i but you know what's funny is that as soon as that actually
> [1:33] **Others:** gets set up is when i know that fanduel's been talking about switching over uh
> [1:38] **Others:** yeah
> [1:40] **Others:** all right i think imran should be coming double check but we could probably go ahead
> [1:56] **Others:** and get started um so i've made a couple of new tickets uh for uh some of the newer
> [2:07] **Others:** work um we've got the uh scim auction
> [2:12] **Others:** lots of provisioning for cloud desktop and code um we've got the mdm config to force
> [2:20] **Others:** the ai gateway routing oh that's done uh oh that's done we pushed it this morning at about
> [2:28] **Others:** 10 a.m so that config applies to all cloud cli users now great uh we've got the uh we've
> [2:42] **Others:** got the mdm config to force the ai gateway routing oh that's done uh oh that's done we've got the
> [2:43] **Others:** uh we've got the mdm config to force the ai gateway routing oh that's done uh oh go ahead arno
> [2:44] **Others:** now there's um two issues with tracking oh dear lord no i can't even remember where
> [2:49] **Others:** did i post it i will put it in the selection afterwards because i genuinely can't remember
> [2:59] **Others:** what i did with it ah here it is i'll just put it in the theme channel okay uh let's
> [3:14] **Others:** see uh we also have the uh the api key provisioning function um i've got four of them this time
> [3:16] **Others:** but i can't remember how much of it there are in the theme channel so i just can't remember
> [3:17] **Others:** from the table here and i've got the xanax for cloud um and i'm sorry it's a new thing
> [3:18] **Others:** provisioning, productionization, and the Kong AI Gateway HA scaling.
> [3:27] **Others:** And these are both for Michael, with API key provisioning being the top priority between
> [3:36] **Others:** those two.
> [3:37] **Others:** Yeah.
> [3:38] **Others:** We've been slacking each other, so I think it's probably good to just have a conversation.
> [3:44] **Others:** Might go so much quicker.
> [3:45] **Others:** Oh, Jesus, there, the faces pops up now.
> [3:49] **Others:** It's Harvey Leo, the boss.
> [3:52] **Me:** I got a little bit of it
> [3:53] **Others:** Okay.
> [3:55] **Me:** kind of architected out
> [3:59] **Me:** where it seems like
> [4:01] **Me:** with the new updates
> [4:03] **Me:** to cloud
> [4:04] **Me:** code desktop
> [4:06] **Me:** or cloud desktop and cloud code
> [4:09] **Me:** we can do SSO
> [4:12] **Me:** for and use
> [4:13] **Me:** Okta for all of it
> [4:14] **Me:** is what I've been reading
> [4:17] **Me:** so we can just
> [4:19] **Me:** deploy
> [4:20] **Me:** the updates
> [4:22] **Me:** like what you were saying
> [4:23] **Me:** with the config files
> [4:24] **Me:** we can deploy
> [4:25] **Me:** the cloud client config
> [4:29] **Me:** through the manage settings
> [4:31] **Me:** dot json
> [4:33] **Me:** similar to what you guys did today
> [4:35] **Me:** no this would be for cloud code
> [4:36] **Others:** But I'm completely confused.
> [4:37] **Others:** Are we talking about the cloud API to do what?
> [4:42] **Me:** and for cloud desktop
> [4:44] **Me:** just the stand alone
> [4:46] **Me:** desktop for access
> [4:46] **Others:** Yeah.
> [4:48] **Me:** for individual users
> [4:49] **Others:** To the API.
> [4:50] **Me:** to
> [4:55] **Me:** cloud just
> [4:57] **Me:** just through your licensing
> [5:00] **Me:** you wouldn't need so
> [5:01] **Me:** we can direct them
> [5:02] **Others:** What do you want to achieve?
> [5:03] **Others:** Sorry, I'm slightly confused here, of course.
> [5:05] **Others:** We said we're going to work on the cloud API, which we currently print the API keys in Kong,
> [5:12] **Others:** and that process belongs to John.
> [5:14] **Others:** So I'm slightly...
> [5:15] **Others:** I'm a bit slow today, in fairness.
> [5:18] **Others:** I'm not quite sure where CLI and Kong and cloud desktop comes into play here now.
> [5:19] **Me:** do we
> [5:25] **Me:** ok so I must have been
> [5:27] **Me:** I just must have been confused on what we were
> [5:30] **Me:** working on because I
> [5:31] **Me:** I had made the assumption I guess
> [5:34] **Me:** that we were working on
> [5:35] **Me:** cloud code and cloud desktop
> [5:37] **Me:** and not the API by itself
> [5:39] **Others:** No.
> [5:39] **Me:** so I can go back in
> [5:40] **Others:** Okay.
> [5:41] **Others:** Well, that's fine.
> [5:42] **Others:** It's the API provisioning we need to work on.
> [5:44] **Me:** ok
> [5:45] **Others:** So currently, there's the legacy work that Leo and Imran did for the hackathon with a
> [5:51] **Others:** specific endpoint.
> [5:52] **Others:** They've provisioned API v2 multimodal endpoint with Sonnet ICO Opus.
> [5:59] **Others:** But currently, people need to request access through ARB to get access to the API.
> [6:10] **Others:** That process currently sits in John's world, and there's some sort of lame-ish automation
> [6:16] **Others:** of how to provision or print those user API keys in Kong, get it approved and get it to
> [6:24] **Others:** the user.
> [6:25] **Others:** It's a very clunky process.
> [6:26] **Others:** Makes a bit more sense now.
> [6:27] **Me:** gotcha yeah yeah that can
> [6:29] **Me:** we can definitely look at that automation
> [6:30] **Others:** Yeah.
> [6:31] **Others:** Okay.
> [6:32] **Me:** yeah yeah it's a
> [6:33] **Me:** makes a lot more sense
> [6:35] **Me:** so I'll go back and
> [6:37] **Me:** take a look at the architecture
> [6:39] **Me:** in that
> [6:40] **Me:** use case rather than what I've been working on so
> [6:43] **Others:** Okay.
> [6:43] **Me:** yeah my
> [6:44] **Others:** Because there's two...
> [6:45] **Others:** No!
> [6:45] **Me:** go ahead
> [6:46] **Others:** It's Grant.
> [6:47] **Others:** There's two very distinct, probably, requirements around this.
> [6:51] **Others:** One is user API keys.
> [6:53] **Others:** Leo wants an API key, forcing the ARB and everything.
> [6:59] **Others:** And then I don't know if we started working on this, Leo, is what happens if an agent,
> [7:03] **Others:** which currently doesn't really have an identity, needs an API key?
> [7:10] **Others:** Because an agent won't be able to do the octo auth.
> [7:13] **Others:** Because an agent doesn't have an identity.
> [7:19] **Others:** We are working with Octa AI to build out an agent identity platform, but at this stage,
> [7:24] **Others:** if I create an agent on Amazon and wants to point it to the AI Gateway API, how would
> [7:32] **Others:** that work?
> [7:33] **Others:** Because we can't expect the agent to do an octo auth.
> [7:39] **Others:** Agent is too stupid.
> [7:40] **Others:** That's not going to work.
> [7:41] **Others:** So that's the one thing we would just have to assume, that if an agent have an API key,
> [7:46] **Others:** it needs to be just probably a valid API key and say, go on, lads, carry on.
> [7:56] **Others:** Does it make sense?
> [7:57] **Others:** Because I know Imran and Leo did some work for the agents registering in our initialized
> [7:58] **Me:** yeah that makes sense
> [8:10] **Others:** platform to register with Kong and bypass that whole OIDC with a separate tenant, because
> [8:16] **Others:** an agent can't click on octo and say, I'm an agent, please let me through.
> [8:21] **Others:** That sort of automation around the one side, the platform side, versus the developer side,
> [8:26] **Others:** the focused side as well, that's the two surfaces.
> [8:29] **Others:** Cool.
> [8:42] **Others:** Go ahead.
> [8:43] **Others:** There is a process.
> [8:44] **Others:** Let me just slide this to you.
> [8:47] **Me:** so we talked about using the Okta
> [8:49] **Me:** AI
> [8:54] **Me:** for that
> [8:55] **Me:** for the API
> [8:57] **Me:** keys
> [8:58] **Me:** provisioning through
> [9:01] **Me:** Okta as well
> [9:02] **Me:** do we want to just auto approve them if they have
> [9:06] **Me:** I don't know what
> [9:08] **Me:** role key we're using for
> [9:10] **Me:** cloud
> [9:12] **Me:** code and cloud desktop but
> [9:14] **Me:** if they have that
> [9:16] **Me:** role do we want to just auto approve
> [9:18] **Me:** the API or do we want that to be a separate process
> [9:22] **Me:** no
> [9:23] **Others:** Are you in the FTG AI support channel?
> [9:24] **Others:** Probably not.
> [9:25] **Others:** I'll put you there.
> [9:26] **Others:** What is happening?
> [9:27] **Others:** Yeah.
> [9:28] **Others:** We are in a tenant in Flutter group.
> [9:31] **Me:** I tried to accept the other invite that you sent out today too
> [9:39] **Me:** it was
> [9:41] **Me:** AI platforms and
> [9:43] **Me:** when I tried to accept it it said
> [9:45] **Me:** it was being awaiting admin approval that makes sense okay yeah that helps a
> [9:55] **Others:** So I can send you, invite you, accept it, but then the Flutter group of companies need
> [10:00] **Others:** to accept it as well.
> [10:01] **Others:** What a lovely world we live in.
> [10:02] **Others:** I've just slacked it there as well.
> [10:03] **Others:** So how it currently works is a user needs to have approved responsible AI or AIG AI governance
> [10:17] **Others:** ticket locked and approved by Lorianne.
> [10:20] **Others:** See that as a separate process, sort of sending out of scope for this one, to be able to request
> [10:26] **Others:** an anthropic API key from a current service desk.
> [10:30] **Others:** Which just points you to a Kong and you put in, I want an API key and I've got a reference
> [10:36] **Others:** number.
> [10:38] **Others:** Once that is approved, so we need to, I'll work with Sam on how we can get those ARB
> [10:44] **Others:** JIRA requests move over to our side as well.
> [10:47] **Others:** I think once that is approved, and Leo helped me out here, it did work as well, is it goes
> [10:52] **Others:** through some sort of Kong automation to print an AI developer or AI tools contract.
> [11:00] **Others:** And then the other one is the consumer API in Kong?
> [11:03] **Others:** Yeah, there's a TF Kong pipeline that creates the consumer and bound to gateway servicing
> [11:18] **Others:** for our out in Kong.
> [11:20] **Others:** Yeah, for Proton, for Stage, two separate keys.
> [11:26] **Others:** Can you see what we mean?
> [11:27] **Others:** It's a very disjointed, shitty process currently, if somebody actually ever used KOS2GET API
> [11:32] **Others:** key.
> [11:37] **Me:** lot for you need to work on them sounds good
> [11:42] **Others:** And myself and Sam will work on see if we can get a new ARB access request board created
> [11:48] **Others:** specifically for anthropic, which is tied to our JIRA.
> [11:52] **Others:** So at least we can do the approvals and once the JIRA approval happens, it must just be
> [11:57] **Others:** automatically create and print the stage and production API keys and pick it out.
> [12:03] **Others:** I know we currently use one password to send out the API keys.
> [12:07] **Others:** I think I want this as human-less as possible.
> [12:15] **Others:** Good.
> [12:18] **Others:** Let's see.
> [12:19] **Others:** I also added the Sonic Five endpoint sync.
> [12:30] **Others:** How are we looking on this?
> [12:32] **Others:** I created a ticket for it, but any update there?
> [12:39] **Others:** Not yet, my good friend.
> [12:42] **Others:** I'm working on the tool front right now.
> [12:45] **Others:** OK.
> [12:47] **Others:** No, but in the closing backlog, you know, I'm working on the semantic reality infrastructure in order of, in terms of to put on the foot, is in progress right now, I'm facing an issue about how the, how the way the secrets are stored in the AWS secret manager, I'm working with Nathan from Cloud Fabric is in progress.
> [13:15] **Others:** And in the meantime, I cook the first version, I guess, of the MCP observability is living on stage environment. From now, I write in, I start to play around with some metric queries, make you want in terms of to share some white or beautiful
> [13:44] **Others:** dashboard.
> [13:45] **Others:** Or query is in progress, I, I start to see some trafficking, some, some values is, it's okay. So it's, it's in work is in progress, too. And so as I finish in the first test, or even semantic routing, or MCP observability, we'll take care of to put on the foot, the
> [14:15] **Others:** software.
> [14:15] **Others:** And that's fine into epi, yeah, I developer house.
> [14:23] **Others:** Okay.
> [14:26] **Others:** And we've got that websites in sheet MCP somewhere in the background.
> [14:31] **Others:** Yeah, either for him or no for Mike.
> [14:44] **Others:** Well, for you, Leo.
> [14:45] **Others:** All right.
> [14:46] **Others:** And then, I mean, big milestone 100% of Clyde sealable.
> [14:50] **Others:** Yeah, it's gonna be.
> [14:50] **Others:** But it's not gonna be.
> [14:50] **Others:** Well, it's gonna be.
> [14:50] **Others:** Yeah, it's not gonna be.
> [14:50] **Others:** Oh, so yeah.
> [14:50] **Others:** CLI traffic going through Kong.
> [14:53] **Others:** So far, so good.
> [14:55] **Others:** Knocking on wood.
> [14:56] **Others:** There's two issues with tracking.
> [14:57] **Others:** So none of it is gateway issues.
> [15:01] **Others:** So that's grand.
> [15:03] **Others:** Great.
> [15:06] **Others:** And then the Prometheus plugin,
> [15:14] **Others:** was that you talking about that, Arno?
> [15:16] **Others:** That was the MCP Yaukey.
> [15:19] **Others:** The observability stuff.
> [15:22] **Others:** Thank you.
> [15:23] **Others:** Yes, okay.
> [15:24] **Others:** Any actions there that we need to take?
> [15:26] **Others:** I will look manually on the Kong data plane,
> [15:28] **Others:** which is probably the worst thing to do,
> [15:30] **Others:** but we'll retrofit it into code.
> [15:33] **Others:** Okay, gotcha.
> [15:35] **Others:** And then a new thing from Imran that he shared
> [15:39] **Others:** was he got a request from, who was it?
> [15:43] **Others:** Let me double check.
> [15:45] **Others:** Craig Rezloski.
> [15:49] **Others:** About setting up postman MCP config
> [15:54] **Others:** in the AI gateway.
> [15:55] **Others:** Is it a post?
> [15:56] **Others:** It is approved.
> [15:59] **Others:** They have a couple of config examples
> [16:02] **Others:** that were approved that Imran shared.
> [16:04] **Others:** But then he followed up with, Craig sent a followup.
> [16:08] **Others:** Hold off on adding the postman config until,
> [16:13] **Others:** or the MCP server does require tool response,
> [16:19] **Others:** restrictions so it looks like they're looking into that more uh before we proceed but I added
> [16:24] **Others:** a backlog ticket for that as well yeah no I think that's some from currently values priorities to
> [16:30] **Others:** look at couldn't give a crap about what mcp to be honest I think basically any user experience
> [16:36] **Others:** semantic routing metering and billing studies of priorities yeah uh metering and billing should
> [16:44] **Others:** be pretty close to done I know Imran was doing some final checks uh
> [16:50] **Others:** well I think that's what I've got the con Dev environment I'm going to follow up with uh uh
> [16:56] **Others:** with John uh that to make sure that we're still on Target for 86 uh and then yeah any other updates
> [17:05] **Others:** uh Leo Arno no just managing the Gateway support channel for today so that's fine
> [17:17] **Others:** it looks at all
> [17:18] **Others:** all right uh chat with y'all soon thanks so much for your time cheers
