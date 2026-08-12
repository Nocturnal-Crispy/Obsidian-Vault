---
date: 2026-08-12
time: 09:14
duration: 1h 40m
participants:
  - Others
  - Me
tags:
  - meeting
  - ai-platform
  - governance
  - cost-optimization
  - evals
  - observability
source: note-taker
---

# AI Platform and Ops Strategy Review

## Summary
An AI platform leader (referred to as Jonathan in the call) walked the team through the current state, vision, and 30/60/90 plan for FanDuel's AI Platform & Ops function. The core thesis: AI adoption is broad but ungoverned, with duplicated knowledge bases, no evals, no real tracing, and costs running over budget — so the two big bets are governance and cost control. Discussion covered the "context spine" knowledge layer, gateway enforcement, intent-based routing, tooling overlap between Datadog/Braintrust/Kong, and near-term execution planning ahead of NFL kickoff on September 9. A separate portion of the recording is unrelated personal phone calls about vehicle title transfers and a motorcycle purchase.

## Key Points
- **Current state gaps:** no standardized platform; roughly four separate knowledge bases observed in ~six weeks; duplicated agents, prompts, and skills written inconsistently; models often used incorrectly; homegrown tools everywhere.
- **No evals and no golden-set benchmarks.** RAI intake exists and is adopted from Flutter, but it isn't actually applied in platform policies and controls.
- **No real observability** — cost dashboards exist in Datadog, but not decision-level tracing, tool-call visibility, or replay. If security reported an incident today, the chain of events could not be reconstructed — described as a massive issue in a highly regulated industry.
- **No adversarial testing** of agents; trust & safety is minimal or absent at scale. Security will own the safety side; a planned hire sits in security with a dotted line to the AI platform team.
- **No LLMOps** for generative/frontier/open-weight models (MLOps exists). Teams auto-switch to the newest model with ad-hoc testing.
- **Audit:** just completed a first internal AI audit (internal team, not Big Four yet — that's expected later). Auditors bring their own framework, investigate, and log items to re-check mid- or end-of-next-year. Worst case is fines — and, per Ramsey, fines multiply per state. The bigger cost is constrained innovation and funding.
- **Vision:** one standard AI platform — trustworthy, fast, economical by default; treated as an internal product with SLAs/SLOs, a paved road, and written standards. Every team builds on a shared foundation instead of rebuilding.
- **Context spine (knowledge layer):** federated, not one vector DB. Data in Databricks (risk/trading) stays put and is accessed by agents via MCP with table-level context; unstructured text/video/image (audio last) gets indexed. Classical ML assets like feature stores stay out of scope. Value comes from compounding every added data source across the enterprise.
- **Documentation sources** are mostly Confluence for engineering, with a trend toward GitHub; enterprise-wide it spans SharePoint/OneDrive, Salesforce, Oracle, Workday, and a coming migration to Google Workspace.
- **Ownership boundary:** the team owns how AI is built, run, and paid for — architecture, deployment, governance, standards, eval bar, API/agentic/skills/MCP contracts, reference patterns. It does not own business logic, prompts, source data, or apps for the business (except tools it builds for itself: policy engine, red team engine, prompt engines, AI SREs).
- **Intent-based routing** is bet #2 after gateway enforcement: semantic routing and a prompt engine remove model/effort/prompt-tuning complexity so engineers describe intent and focus on business logic.
- **Evals as unit tests:** the mindset is evaluate-first — nothing ships without passing a threshold. Warned against lazily piping everything to LLM-as-judge; real evals need golden sets (~200 prompts, not 10), retrieval-specific checks, classifier/ROUGE-type scoring depending on the task.
- **Cost:** goal is cutting 40–60% of spend; currently in overage. Cost is more than tokens — it includes partner contracts, procurement purchases, and corporate-card AI tooling. Duplicate tools are showing up repeatedly in RAI intake.
- **SaaS AI pricing risk:** vendors like Salesforce (Agentforce), Oracle, Workday are going AI-native with no bring-your-own-model, discounting early then raising renewals after teams build in prod. AI labs turn on model-specific pricing without security review.
- **Open-weight models:** substitution is a 2027 play. Speaker has previously built a GPU cluster and moved off cloud frontier models to cut cost, especially for internal tooling. Also a lever in negotiations across OpenAI, Anthropic, and Google.
- **Platform components named:** Kong (control/access/orchestration), Initialize, Braintrust (evals/LLMOps), Datadog (observability/cost/reliability), Redis (context spine pilot — broader FanDuel use, vector store, data-to-MCP), plus trust & safety with security.
- **Growth:** function expected to reach 20+ people by 2027, especially SRE/AI ops; plans to explore offloading enterprise tooling and gateway work.
- Ramsey noted Datadog can run evals itself and trigger them through an external AI gateway, ingest OTel traces, and carry evaluations in the trace — potentially a faster path than standing up Braintrust.
- Braintrust ownership is still mid-transition from the data team to platform; the speaker doesn't yet have full control/access.

## Decisions
- Two big bets: governance and cost control/savings, with gateway enforcement as bet #1 and intent-based routing as bet #2.
- All AI traffic — including enterprise AI tooling — routes through the gateway; nothing ships to prod without review and nothing off-platform (acknowledged as aspirational, not enforced by chasing people down).
- Short term, use Datadog for tracing across the board rather than waiting on Braintrust; revisit Braintrust later for topics/data sets and more sophisticated evals. Shipping traces to both destinations remains an option.
- For the 30/60/90, evals means demonstrating out-of-the-box Braintrust evals plus full tracing piped to Datadog — enough to prove the capability exists.
- Context spine will reuse what Conrad's team already built for the AI DLC anchor use case rather than migrating to Redis now; Redis is a pilot for later.
- Robust LLMOps capability deferred to next year; open-weight model substitution targeted for 2027.
- Rollout sequence for scaling after the 90-day mark: Sportsbook, then Casino, then Racing.
- The team will not own the full open-weight strategy — it's a joint strategy with security and the BUs; the platform team owns the AI/ops side, controls, and governance.
- The speaker is agnostic on process (Scrum vs Kanban); the requirement is one place to roll up roadmaps and progress.
- Use the Claude SDK for the anchor use case rather than Strands then LangChain.

## Action Items
- [ ] Jonathan: Write the AI platform standards doc in the next week or so.
- [ ] Jonathan: Ask the internal audit team for the framework they audited against.
- [ ] Jonathan: Reconcile his execution plan with what already exists and get it all into Jira/era with formal structure.
- [ ] Jonathan: Share the 30/60/90 materials and spreadsheets (located in SharePoint) with the team.
- [ ] Jonathan: Chase the identity team to resolve MK's access issues.
- [ ] Jonathan: Work the thread with Jerry, Christian, and others on external-partner access — shipped laptop vs. provisioned workspace — and include MK.
- [ ] Jonathan: Meet with Mr. Dixon about offloading SRE/AI ops and enterprise tooling/gateway work.
- [ ] Jonathan: Sit down and define the open-weight model approach, including choosing a partner (Meta, Mistral, etc.).
- [ ] Jonathan and Sam: Work together this week (async/offline) to build the next two-to-four-week plan and get the work structured into Jira.
- [ ] Jonathan / security: Continue hiring for the trust & safety role in security (dotted line to the platform team) and stand up adversarial testing frameworks.
- [ ] Conrad's team: Continue work toward 100% code-triggered security and review agents by NFL kickoff on September 9 (already demoed to CTO Andy Shea).

## Open Questions
- How traces should ultimately split between Datadog and Braintrust once ownership and capabilities settle — including whether to dual-ship (possibly via Vector) and what that costs.
- Who formally owns Braintrust; the transition from the data team to platform is still in flight.
- Which open-weight model partner to standardize on, and how to isolate and run it (on-prem/own hardware CapEx vs. cloud).
- How to handle AI cost for AI-native SaaS products (Salesforce, Oracle, Workday) where spend sits in the BU, not the platform, and no BYO model is possible.
- Whether the AI platform team eventually merges with the broader platform engineering team — can't be discussed until the AI platform is built and scaled.
- Whether anything is running in Azure at all, and what exists across GCP alongside the AWS-heavy footprint.
- Whether token consumption (and therefore cost) will rise or fall as more use cases onboard, and how to weigh that against the value delivered.
- How to avoid overlapping vendor capabilities (tracing, prompt compression, evals available in Datadog, Kong, and Braintrust) and set a standard with a phased rollout.
- Where truly sensitive data lives across the business that teams won't ship out of their environments — pending the speaker's rounds across the BUs.

> [!quote]- Full transcript
> [0:00] **Others:** say bottoms up and top down and like from board all the way down to people joining um and you
> [0:06] **Others:** know one of the trends i've seen with people coming out of colleges or like interns and then
> [0:12] **Others:** converting to like ftes is that they they expect that organizations have this stuff right that it's
> [0:20] **Others:** available for them to use uh and they're actually starting to evaluate uh their decisions based on
> [0:27] **Others:** what's available from a tooling perspective is a factor now uh so you know full adoption go use
> [0:34] **Others:** doesn't matter ignoring how it was rolled out ignoring anything else uh everyone's using it
> [0:40] **Others:** right tons of tools uh partners you see the gpts the cursors the anthropics the windsurf you see
> [0:48] **Others:** the um i mean you name it what's the other one um the uh lovable uh all over the place right
> [0:56] **Others:** lots of
> [0:57] **Others:** overlap etc um and what ends up happening is that cost starts going out of control and it's not
> [1:04] **Others:** governed right we operate in highly regulated industries uh in the industry um and that will
> [1:11] **Others:** start to uh take effect on everything which ties the cost as well so over budget uh there were
> [1:18] **Others:** structural gaps right from the start uh no standardized platform uh everyone's rebuilding
> [1:23] **Others:** the same stuff i've seen uh since i've been here
> [1:27] **Others:** about
> [1:27] **Others:** seven
> [1:27] **Others:** seven
> [1:27] **Others:** six weeks probably four different knowledge bases right um i've seen same agents you know
> [1:34] **Others:** with slight variations uh for what they're doing uh i've seen prompts i've seen skills uh all
> [1:42] **Others:** written differently and i'll um i've seen models used incorrectly but it's perfectly normal uh in
> [1:50] **Others:** my experience because of you know it's go use it and then people will do their research on how to
> [1:56] **Others:** use it some better than others
> [1:57] **Others:** and some just use it to get things done right uh lots of homegrown tools which is great um you know
> [2:04] **Others:** there's no evals uh you know evaluating your prompts and and we don't have golden set evals
> [2:12] **Others:** that we can benchmark against um we do have our ai from intake which is great but we actually don't
> [2:19] **Others:** apply any of it coming down from flutter then we adopt it create our own but we're not actually
> [2:25] **Others:** applying it in principle we're not applying it in principle we're not applying it in principle
> [2:27] **Others:** in policies and controls on the platform we are sort of but like all that needs to change as
> [2:34] **Others:** everything changes right so it needs to be more strict um agent identities are now just coming
> [2:39] **Others:** into play um so people are building agents own frameworks um they're using maybe strands or
> [2:47] **Others:** agent core uh or even the google adk uh or they're not using it at all uh just writing functions
> [2:53] **Others:** um there is no uh true observability
> [2:57] **Others:** uh and what i mean by that is not that we can have cost and uh everything like that in data dog
> [3:06] **Others:** i mean like legit tracing understanding why decisions were made by the agents
> [3:13] **Others:** what tools have been called um being able to replay uh something so if you take the example
> [3:22] **Others:** of a security incident happening um if if security were to happen in a security incident
> [3:27] **Others:** um if security were to come to me today tyler or somebody else jerry say hey we had this incident
> [3:33] **Others:** uh and it came from said tool said on the platform we need to replay the entire chain of events we
> [3:41] **Others:** wouldn't be able to do that um so that's a massive issue in in our type in our industry um there is
> [3:49] **Others:** no uh understanding what's actually running from local machines to actually in the various
> [3:57] **Others:** environments and upstream into production across our cloud providers um i know we're very aws heavy
> [4:05] **Others:** here makes sense but we're also um from an enterprise used gcp as well um and of course
> [4:13] **Others:** you have microsoft thrown in there so who knows what's in if we there's anything in azure i have
> [4:17] **Others:** not i have no idea um there's no adversarial testing on the agents themselves uh which is
> [4:24] **Others:** a big piece and ties into trust and safety uh and i think that's a big piece of the
> [4:27] **Others:** uh so security will own the safety side of it and uh you know the the person uh that we're
> [4:35] **Others:** looking to hire there will sit in security they will dotted line into me uh because they'll be
> [4:41] **Others:** very tied to the platform what they find and this goes into open way model strategy as well
> [4:46] **Others:** uh we have to then turn around and say okay well we can't have that happen
> [4:50] **Others:** we need to implement that um and that can come various ways um there's no feedback loop period
> [4:57] **Others:** uh and that's just because and it could well i won't say period i would say that maybe teams
> [5:03] **Others:** have implemented some sort of feedback um again everything's kind of like disparate within domains
> [5:11] **Others:** and products and that stuff right so there's maybe potentially feedback to improve on that but
> [5:17] **Others:** if you don't have evals uh if you don't have tracing if you don't have your own internal
> [5:22] **Others:** audit if you don't have an ai data strategy uh what do you do with this generated content
> [5:27] **Others:** con uh generated content how do you classify it you know all this other stuff how are you
> [5:34] **Others:** going to handle fine tuning you probably don't have full feedback loop there right um llm ops is
> [5:40] **Others:** it doesn't uh exist ml ops does but for generative in these models from open weight to actually
> [5:47] **Others:** frontier models uh that doesn't exist a lot of folks and this is normal uh will just automatically
> [5:53] **Others:** switch to the newest model um and they may do some testing
> [5:57] **Others:** and be like oh okay it's great or it's better um and then they'll switch to that when that's
> [6:02] **Others:** um from a cost perspective and and trying to wrangle this there needs to be an actual like
> [6:06] **Others:** real program there uh so these are some of the things right and this is very normal
> [6:10] **Others:** when people are are you know unleash ai um in an enterprise right but so what's the
> [6:19] **Others:** vision and positioning for platform ai platform and ops uh we're the core of ai uh everything
> [6:27] **Others:** at
> [6:27] **Others:** fandel differentiates on top of us it's just one standard ai platform right it's trustworthy it's
> [6:33] **Others:** fast and it's economical to build by default uh every every team builds on a shared foundation
> [6:39] **Others:** uh instead of rebuilding it right so again instead of having you know um if you look at
> [6:46] **Others:** the knowledge base i think is one of the uh more complex things that we'll be doing is uh if that's
> [6:53] **Others:** being replicated four or five times over by different teams uh how the data is handled
> [6:57] **Others:** again everything i talked about before will be different in every team um and they're just
> [7:03] **Others:** rebuilding the same thing maybe same technology maybe different technology um and uh we're we're
> [7:10] **Others:** actually not able to do the biggest part of having like a knowledge layer across the enterprise
> [7:14] **Others:** uh which is being able to compound the advantage of every data source that you add um that and no
> [7:24] **Others:** single team can actually do this by themselves so if you look at the data source that you add
> [7:27] **Others:** every data source you add to a knowledge layer agents would have access to based on certain
> [7:33] **Others:** permissions and stuff like that but the point is is that you you actually don't need to create it
> [7:40] **Others:** yourself and be siloed is that you can just create an agent give it the um you know the
> [7:47] **Others:** indexes and what you need to do and have the appropriate permissions and it can leverage
> [7:51] **Others:** data across the organization right um so you can create really more
> [7:57] **Others:** enterprise-wide type agents and still create very specific ones for products or or for your
> [8:04] **Others:** teams or tooling but it's going to have access to the context that it needs and it's it's
> [8:10] **Others:** automatically going to be handled by a centralized team um so uh pure mission right with that i mean
> [8:18] **Others:** you have a shared ai foundation um we treat this as a product our customers are um internal so
> [8:26] **Others:** they are and they're going to be able to do it themselves and they're going to be able to do it
> [8:27] **Others:** themselves and they're going to be able to do it themselves and they're going to be able to do it themselves
> [8:27] **Others:** and they're going to be able to do it themselves and they're going to be able to do it themselves
> [8:27] **Others:** team uh our stakeholders are every executive leader here um which means we we back it with
> [8:35] **Others:** slas slos uh there's a paved road we have standards um so i'll be writing the uh ai platform standards
> [8:43] **Others:** uh in the next week or so we have a a shared knowledge layer um and every agent inherits that
> [8:51] **Others:** knowledge um but again the biggest thing is if you boil all this down what are the what is like
> [8:56] **Others:** the the the the the the the the the the the the the the the the the the the the the the
> [8:57] **Others:** two main things that we're really focused on it's governance and cost um and these are all the
> [9:03] **Others:** mechanisms that we have to get to get there just went through my first audit here luckily we had
> [9:08] **Others:** a lot in place um to be able to talk through it uh and show and essentially you know it was
> [9:16] **Others:** technically my first i would say more like detailed ai audit but they can become i have a
> [9:27] **Others:** so it was very similar to other audits i've been through whether it was security or cloud um but
> [9:33] **Others:** like this could get very detailed where um they expect all of these things that i'm going to show
> [9:41] **Others:** you that we need capabilities components to be in place and the full tracing and cost attribution
> [9:47] **Others:** and how we do that and what we're doing to further enhance this and and keep up with um state
> [9:55] **Others:** regulations like different policies and other things that we're doing to further enhance this
> [9:57] **Others:** all that stuff will get more granular as um audit for ai starts to mature
> [10:03] **Others:** uh making five good question there who's who's auditing i'm just curious
> [10:10] **Others:** it's an internal audit it's our own audit team right now it's not a big four yet um but that
> [10:17] **Others:** that probably will be coming okay okay so they come and audit the the teams or exact like you
> [10:25] **Others:** come with like
> [10:27] **Others:** you know they interview they they come with like prescribed things that they want to understand so
> [10:34] **Others:** they come with their own frameworks right so they have a framework that they go off of um they called
> [10:39] **Others:** it out i'll ask for it um and then they go by that and then they do an investigation and then
> [10:47] **Others:** they come up with like hey here's here are your key items that like we need to resolve it's almost
> [10:53] **Others:** like if you go under if you've ever been through a security
> [10:57] **Others:** review right like kind of the same um and then you know sometimes it's you know you basically
> [11:05] **Others:** would right now it's pretty much just show us we know that you guys are building this we know that
> [11:10] **Others:** this is you know starting mature and we haven't scaled yet um we're trying to get to maturity and
> [11:15] **Others:** scale so just show us like you know that you have these things in place and if you don't
> [11:21] **Others:** we'll mark it down we'll track it uh you know and by
> [11:27] **Others:** uh let's say each you know halfway of next year we'll check back or end a year they'll do another
> [11:32] **Others:** one right um so ultimately all what could happen is that we get fined and it costs us money at the
> [11:39] **Others:** end of the day right um but it doesn't work for me um yeah go ahead i was gonna say fine by you
> [11:49] **Others:** know every individual state so it's like 30 times the fine they love it exactly
> [11:57] **Others:** yeah good call um which ultimately to ramsey's point right like one it's a it's a reflection
> [12:05] **Others:** but more importantly i think like it limits us for how we can innovate um scale do things that
> [12:15] **Others:** we really want to do uh because you know that it all ties into investment and funding yeah so like
> [12:23] **Others:** ramsey's right and uh we just don't want to be in that place
> [12:27] **Others:** um you will see in various presentations i do depending on the audience i'm talking to
> [12:34] **Others:** uh when we talk about the bets you'll see anywhere from four to five sometimes i like kind of
> [12:41] **Others:** combine uh one of them again it just depends on the audience but the the themes of what the bets
> [12:46] **Others:** are will remain the same right i mentioned if i were to say two big bets it's governor
> [12:51] **Others:** we need to focus on governance and cost savings um and control um but
> [12:57] **Others:** for us it's really you know it's number one one paper road and enforcement right that's that's the
> [13:03] **Others:** gateway um you know we we did we have discovery going on uh to understand what's out there but
> [13:10] **Others:** we need to have everything running through the gateway um and number two would be like
> [13:16] **Others:** the intent-based routing um so this is looking at where you're kind of removing the complexity
> [13:24] **Others:** of uh the engineers of
> [13:27] **Others:** you know i would say you know figuring out which is the best model uh the best effort or reasoning
> [13:35] **Others:** uh how to handle the prompts per model or per like reasoning or effort um really helping them with
> [13:45] **Others:** that's like the semantic routing um a prompt engine these types of things right so the
> [13:50] **Others:** engineer can come focus on the business logic and the problem
> [13:57] **Others:** and they would be describing their intent what are they intending to do or have this agent or
> [14:02] **Others:** system of agents uh doing right and we handle the rest and you can see that through uh the gateway
> [14:10] **Others:** through initialize and even when we start getting evals so the challenge with evals is traditionally
> [14:16] **Others:** that's a very machine learning data science um area of focus like we always had to do that stuff
> [14:23] **Others:** so it's like natural to us but when you start getting into
> [14:27] **Others:** folks that you know devops you get into you know application engineering you get into
> [14:34] **Others:** even ui ux or you get into like true software engineering like any type of engineering there
> [14:41] **Others:** evals some do that but they don't under some of them don't understand that literally evals
> [14:47] **Others:** are the unit test of ai right like they don't ever ship anything without their various tests
> [14:52] **Others:** and we have our own for ai um so we just want to remove a lot of that complexity
> [14:57] **Others:** where we can now i do understand there's still a component of training upskilling folks on how to
> [15:03] **Others:** do that um but there's also core base ones that we can automatically handle uh up front uh yeah
> [15:11] **Others:** i was gonna say being able to automate that because that stuff's kind of hard and it can
> [15:15] **Others:** be expensive to just run a massive eval if someone does it accidentally for everything
> [15:20] **Others:** exactly and you know randy i see this often and people will do this like people will take the
> [15:27] **Others:** path to it to say that they're doing evals so like they'll use like llm as a judge
> [15:34] **Others:** right but the reality is is like is it even necessary and they'll just pipe it all to that
> [15:38] **Others:** and then they'll get a score and let it handle it and say oh i have evals and it says it's good
> [15:43] **Others:** um that is a an option to do but it depends like your eval should be very specific how you evaluate
> [15:50] **Others:** whether you retrieve the right information from a vector database based on the input
> [15:57] **Others:** depends on the data and it depends on what you're doing it's also deep learning models
> [16:03] **Others:** like a bert classifier which means you have to have the golden set of prompts and i want
> [16:08] **Others:** like 200 to 200 of those not like 10 that are written by people with the inputs and expected
> [16:14] **Others:** responses uh you have various uh rogue scores um and if it's language translation that changes
> [16:23] **Others:** you know we don't have to necessarily deal with that but in the past i've had to deal with that
> [16:28] **Others:** so like evals can get very difficult to ramsey's point um so anyways but the the mindset is it's
> [16:35] **Others:** really a mindset like evaluate first like nothing should be shipped and deployed until there was
> [16:40] **Others:** some evaluation you know based on the threshold uh and then it can it can go forward um so that's
> [16:46] **Others:** the way we look at it um really the moat is two layer enforcement right perimeter plus runtime um
> [16:53] **Others:** this is that trust and safety stuff so you know the way i kind of look at where i want this to go
> [16:58] **Others:** is ci is going to be so critical for for a lot of this stuff i want a lot happening there uh before
> [17:06] **Others:** anything gets shipped uh or deployed and um there will be different kind of gates and how this works
> [17:12] **Others:** so how we integrate things but as i mentioned before the the trust and safety layer of this is
> [17:20] **Others:** very minimal or doesn't
> [17:23] **Others:** exist in some capacities at scale at fandle um and that's something i'll be focusing heavily on
> [17:30] **Others:** um context spine that's just what we call it here it's the knowledge layer
> [17:34] **Others:** it is not just one vector database i look at it as a federated model a great example
> [17:41] **Others:** is um risk and trading team and or the teams that are using uh data bricks like i have no intention
> [17:47] **Others:** of uh yanking all that data into a centralized place the intention i have with that is that
> [17:53] **Others:** agents are able to access it uh via mcp but it can access it in a way that it understands the
> [18:01] **Others:** context of all the tables any information generated from that which is unstructured
> [18:07] **Others:** would probably be processed you know indexed or metadata is captured uh
> [18:13] **Others:** etc but classical ml stuff like feature stores all these other things like that wouldn't be inside the
> [18:23] **Others:** context of it so it's not just a vector i mean it could just be like no sequel i'm sure we'll have
> [18:28] **Others:** our own structured tables in there as well um so but it's going to be and it's more than just text
> [18:35] **Others:** it's it's video images uh and then um audio would be last right and that's something that probably
> [18:43] **Others:** you know i don't really know the full customer service and vip experience yet but
> [18:48] **Others:** if audio comes into play um that would happen right um
> [18:53] **Others:** so when we think of this context spine we look at it ignoring technology and you know
> [19:00] **Others:** what we're doing it's it's really focused on unstructured uh data from text video audio or
> [19:06] **Others:** text audio video image um so luckily i think a lot of that stuff is off the shelf to some degree
> [19:17] **Others:** so hopefully it's just integrating oh really interesting okay that's cool yeah
> [19:25] **Others:** yeah some of the stuff i am a bit concerned about honestly ramsey are are like the architecture
> [19:31] **Others:** diagrams and those specs and stuff how complex system diagrams um that can get quite complicated
> [19:40] **Others:** but yeah and the barrier to entry is really low so there's a lot of just kind of noise at the moment
> [19:47] **Others:** makes sense is confluence the primary source right now for most of the documentation and knowledge or
> [19:55] **Others:** do we have a bunch of other um yeah i think for especially like oregon then you know ever outside
> [20:05] **Others:** of a couple teams i think it's almost all confluence um we try and stick to sort of auto
> [20:12] **Others:** generated docs um or anything that um like llm can see but i think for the most part people just
> [20:19] **Others:** kind of throw stuff in confluence um yeah github
> [20:25] **Others:** i'm starting to see a trend ramsey where people are talking about getting off of confluence on the
> [20:30] **Others:** github um yeah and this goes it even gets uh you know but that i would say like
> [20:43] **Others:** there but when you look at it remember we're looking at at two ramsey at enterprise so
> [20:48] **Others:** hr finance that they own on a team the comp team like any talent whatever you know they're using
> [20:57] **Others:** uh different tools than what we would use right confluence they may never even use it
> [21:03] **Others:** right um that could be all right now microsoft uh like onedrive sharedrive um
> [21:10] **Others:** and yeah salesforce too i think a lot of the customer facing stuff is salesforce exactly
> [21:16] **Others:** oracle uh workday you look at uh as we migrate to works google workspace like that will change um
> [21:24] **Others:** so yeah exactly
> [21:27] **Others:** exactly um so i wanted to lay the boundary out as well like it's pretty much like platform like
> [21:34] **Others:** what we're a platform team um you know i know there's overlap with the the real uh other
> [21:42] **Others:** platform engineering team we're just focused on ai and everything there whether that merges into
> [21:49] **Others:** you know one just platform team no idea but we can't even have those discussions until we've built
> [21:55] **Others:** out our stuff and scaled it
> [21:56] **Others:** But I just laid out like what we own, what we don't. Right. We own how AI is built, run and paid for. We don't own what it's built to do. Right. Now, the one caveat to that is when we build for ourselves. Right. For AI platform and ops. Right.
> [22:16] **Others:** A great example would be I have a I haven't I have a good draft going for a policy engine. I have a red team engine that I want to do. There's prompt engines, anything from ops like AISREs. Right. Like it's stuff like that, that we're building to accelerate to help the platform.
> [22:41] **Others:** We would own all of it. But majority of scaling.
> [22:46] **Others:** We just wouldn't own it. Right.
> [22:49] **Others:** You know, we do own the architecture, deployment, security, governance, that stuff. Right. Security owns security. But like we're very coupled with them. So it's again, it's kind of like dotted line back and forth.
> [23:02] **Others:** The paved road, talk about the context line, all unstructured, you know, the kind of rules of like nothing goes to prod without review, like nothing off platform.
> [23:14] **Others:** Like those are pretty bold statements.
> [23:15] **Others:** But like the reality.
> [23:16] **Others:** The reality is, is that that's how it has to happen.
> [23:19] **Others:** And I'm not naive.
> [23:22] **Others:** I understand that it's still going to happen.
> [23:24] **Others:** I'm not going to chase folks down.
> [23:26] **Others:** The platform will be there.
> [23:27] **Others:** We'll support it.
> [23:28] **Others:** We have to demonstrate the value of it.
> [23:30] **Others:** So people will naturally want to be on it.
> [23:33] **Others:** And, you know, that's there's other things involved with that.
> [23:36] **Others:** We own the standard of the platform, the eval bar.
> [23:39] **Others:** Right.
> [23:40] **Others:** API, agentic skills, MCP agents that those contracts.
> [23:44] **Others:** We own reference patterns.
> [23:46] **Others:** Right.
> [23:46] **Others:** We set the bar and then the BU's domains, they meet at the teams.
> [23:52] **Others:** Right.
> [23:53] **Others:** What we don't own is like the business logic.
> [23:57] **Others:** Like we don't sit in casino.
> [23:59] **Others:** We would not own that logic of how they should be building their agent, like actually the logic of the agents and their systems.
> [24:08] **Others:** But or the prompts.
> [24:09] **Others:** Right.
> [24:11] **Others:** Or the data sources themselves.
> [24:13] **Others:** So.
> [24:14] **Others:** Great example of that, you can go back to Databricks or even Confluence, like, if we're pulling all that stuff into the context spine, we don't own the source, like the source data, we would be able to help them and tell them that the data quality is like various levels of it and what they could do to make it better.
> [24:34] **Others:** But we don't own the actual source.
> [24:39] **Others:** Right.
> [24:40] **Others:** Unless it's unstructured within our or generated.
> [24:44] **Others:** Content.
> [24:46] **Others:** So.
> [24:49] **Others:** This is just how a platform pays for itself.
> [24:52] **Others:** Our main goal is to cut 40, 60% of spend.
> [24:56] **Others:** We have an overage and this is a couple of weeks ago where we're hiring this.
> [25:01] **Others:** I think one thing to you guys, don't forget, and you see this in the support channel, we talk a lot about platform and how we're going to support engineers and other parts of the business.
> [25:14] **Others:** Well, those other parts of the business and engineers, it's all the enterprise AI tooling as well.
> [25:20] **Others:** Right.
> [25:20] **Others:** All that needs to be piped through the gateway.
> [25:24] **Others:** But like I own the relationships, cursor, Google, Anthropic, Open AI, etc.
> [25:34] **Others:** So that that this all ties to the contracts.
> [25:38] **Others:** And so any enterprise AI tooling.
> [25:42] **Others:** And I'm sure some of you are familiar with that.
> [25:44] **Others:** Your heads are turning about a couple of things would come through the AI platform and ops team.
> [25:49] **Others:** Right.
> [25:50] **Others:** Where it gets tricky.
> [25:52] **Others:** Are your traditional SAS products like Salesforce, Oracle, Workday, some of these bigger ones that we use because their trend is they're not separating those anymore.
> [26:09] **Others:** It's they're AI native.
> [26:12] **Others:** You know, you can't bring.
> [26:14] **Others:** Your own model to it.
> [26:15] **Others:** It's built into their pricing and where those sit.
> [26:21] **Others:** So, like, there are some nuances in those cases, and that is a little bit tricky and how that's that handled.
> [26:29] **Others:** And even like that cost of that technology would not even would not sit within platform sits within that view.
> [26:39] **Others:** But we're trying to understand, like, the hard part is, is.
> [26:44] **Others:** Salesforce, for example, I always pick on them, they they are like pushing hard and offer discounts like, oh, yeah, you can you use agent force to do all these great things and then people go and build all this stuff.
> [26:55] **Others:** And the next thing, you know, a year later, they say, oh, OK, well, that's great.
> [26:59] **Others:** Here's the new contract and you're using all this stuff and it's gone up by, you know, 50 percent.
> [27:07] **Others:** Right. And now people have built stuff in prod.
> [27:08] **Others:** They rely on it. They've trained on it.
> [27:10] **Others:** All this other stuff. So, like, we're seeing that trend also.
> [27:13] **Others:** With the AI labs, what we're seeing is like they are they're pricing for things like model specific and they're just turning stuff on.
> [27:27] **Others:** We haven't done a security review.
> [27:29] **Others:** And I know there's like, you know, we have a whole RIA intake that is overloaded.
> [27:35] **Others:** There is just a lot going on there.
> [27:38] **Others:** And so they're another beast to manage.
> [27:43] **Others:** But.
> [27:43] **Others:** If you look through this, like I think like the first three are pretty clear, the open way model substitution will be coming.
> [27:52] **Others:** There's still me as soon as I get time, I'm going to sit down and do this.
> [27:56] **Others:** I've already done this at another company with the open way models.
> [28:01] **Others:** I built my own GPU cluster, got off cloud frontier models, cut a ton of cost for doing especially internal stuff like internal tooling and other things.
> [28:11] **Others:** So, like, I know it's very valuable.
> [28:13] **Others:** But like.
> [28:13] **Others:** We need to be very prescriptive in how we're going to do this and how we're going to isolate and do these things.
> [28:21] **Others:** Right.
> [28:22] **Others:** So that will be coming.
> [28:23] **Others:** That's kind of like that orange really kind of means beyond 30, 60, 90.
> [28:28] **Others:** But that would be 20, 27 for sure.
> [28:32] **Others:** So kind of talk about platform capability where you'll hear me talk about components, but capability control and access.
> [28:42] **Others:** Kong orchestration.
> [28:43] **Others:** Lifecycle initialize evaluation, brain trust, LLM ops.
> [28:47] **Others:** Right now, there's things within Kong and brain trust that we can tie to it, but that's got to be a completely separate team and function in how we do that.
> [28:57] **Others:** Observability, cost, reliability, data dog, contact spine.
> [29:03] **Others:** I'm leaning towards Redis for a pilot to do this.
> [29:06] **Others:** It's much broader application at FanDuel outside of AI, right, because we use Redis a lot here.
> [29:13] **Others:** And you guys know that our tooling uses it.
> [29:20] **Others:** So I've used them in the past and forever, actually, but they have some really interesting stuff around their vector store and how your data, you can immediately turn your data into MCPs, which is very nice.
> [29:37] **Others:** So it'd be very helpful for agents and isolating and everything.
> [29:42] **Others:** Trust and governance or trust and safety.
> [29:46] **Others:** That is me partnering with security.
> [29:49] **Others:** We're actively looking to hire someone there.
> [29:53] **Others:** But yeah, that's that piece you'll see, like, baselines, like week one, week one, the plumbing week, one.
> [30:00] **Others:** Live, like, these types of things, and they are in various stages.
> [30:05] **Others:** But this is my 3690.
> [30:08] **Others:** Excuse me.
> [30:09] **Others:** This is hour 30, 60 and 90.
> [30:11] **Others:** 00, 00, 00, 00, 00, 00, 00, 00, 00. This is what I program too.
> [30:12] **Others:** presented i know that we are with each one of these have progression in certain areas some not
> [30:18] **Others:** so much some more so all this stuff will be shared you can go through it um it's really not
> [30:26] **Others:** it seems like a lot but i gotta be honest with you it's it's really not right i mean it is excuse
> [30:35] **Others:** me for the size of the team but you got there's already a ton done at the end of the day if i
> [30:41] **Others:** summarize this it's just an end-to-end platform uh it's that we can uh onboard agents uh and
> [30:48] **Others:** provision keys like all the cool stuff of injecting evals at the ci or whatever like that's all later
> [30:56] **Others:** stuff right all we're trying to do is have a governed end-to-end platform uh and being able
> [31:02] **Others:** to demonstrate that this we're doing things with each capability of the platform to be able to
> [31:08] **Others:** reduce cost to 40 60 percent right that's literally what we're
> [31:11] **Others:** doing um how we get there is um it is written out but we may obviously pivot slightly depending
> [31:20] **Others:** right but as long as we have the main capabilities there like llm op stuff like we will not have a
> [31:27] **Others:** robust bus capability till next year uh context spine we will be leveraging what's already been
> [31:33] **Others:** built by uh conrad and team uh so like having that fully scalable for all use cases not happening
> [31:41] **Others:** but it would happen for our anchor use case aidlc right and it can stay in that technology we're
> [31:47] **Others:** not looking to like say oh we're going to fully migrate to redis and then maybe to this graph
> [31:52] **Others:** database or whatever it is um it's fine to have it in place and we can always have a plan later
> [31:58] **Others:** um as we settle and get through pilots and other things um 2027 aspirational at least you can see
> [32:06] **Others:** kind of like where my head's at with this stuff um so i think one of the things that we're trying to
> [32:11] **Others:** the biggest things i would love to see is we don't have any ungoverned agents uh running um that'll
> [32:18] **Others:** be very hard but by nfl kickoff september 9th uh looking at like 100 of code triggers of security
> [32:24] **Others:** and review agents and that's what conrad's team's working on um so we demoed that to or excuse me
> [32:30] **Others:** they demoed that to uh our cto andy shea uh went well um and then you know work with them and
> [32:37] **Others:** obviously mk you've been involved and you know others working on the gateway and
> [32:41] **Others:** stuff and when you get to like evals like for example uh i like the for the 30 60 90 it's just a
> [32:50] **Others:** it's literally just hey we have what's out of the box in brain trust evals we can demonstrate that
> [32:57] **Others:** we are doing that and actually kind of kicking that capability off and we have full tracing uh
> [33:04] **Others:** and then it's piped in the data dog for observability so that like there you just
> [33:08] **Others:** covered like the use case all the components that we're working on and then we're working on the
> [33:10] **Others:** data dog for observability so like there you just covered like the use case all the components
> [33:11] **Others:** of the our capabilities of the platform uh and then but it we can actually uh scale this in
> [33:17] **Others:** scaling it means like starting with sportsbook okay cool doing um casino great doing racing
> [33:25] **Others:** awesome like there will be like a plan of how we actually roll this out uh because that literally
> [33:31] **Others:** will be like the proven ground we'll be testing we'll be optimizing adjusting right but the point
> [33:37] **Others:** is is that we're able to do that so we can get to scale
> [33:41] **Others:** you know after that 90 days i know i have it here is 90 well it's 90 scale uh so you get it any
> [33:48] **Others:** questions on this um i think for what it's worth data dog can do it can run evals and it can run
> [33:57] **Others:** them through an ai gateway if you don't want to use theirs um that's good so you can potentially
> [34:04] **Others:** tie those together if you want it to be a little bit quicker i mean yeah like there's other eval
> [34:09] **Others:** but data dog can trigger it um
> [34:11] **Others:** itself that's actually thank you for that because that's one of the things that we're
> [34:17] **Others:** all going to have to work on like together is like look like you know all like because
> [34:23] **Others:** if you look at ai platforms i would bucket it is it is a hodgepodge of technology it's a bunch of
> [34:31] **Others:** vendor um touring and then it's going to be custom that we do right and with the vendor stuff is like
> [34:37] **Others:** so much overlap to your point ramsey like even from tracing like
> [34:41] **Others:** every one of them you can do it right we talked uh yesterday mk we were talking about prompt
> [34:46] **Others:** compression oh yeah you were there and um that's awesome right but i think like i could be wrong
> [34:52] **Others:** but even if the kong doesn't have it yet they will right and like how do we actually make sure
> [34:58] **Others:** that we're utilizing the technology efficiently and we have like a standard but to your point
> [35:04] **Others:** it could be hey let's start here and then kind of have a plan to roll out
> [35:11] **Others:** like very specific that that's the type of information that i need um honestly that's
> [35:17] **Others:** awesome um i think one of the things that we i definitely am going to push on um to get done
> [35:25] **Others:** is definitely like we just need to we'll have a higher i hope in security soon um that will work
> [35:33] **Others:** with us uh but do get some adversarial uh testing and frameworks and um together like how we do it
> [35:43] **Others:** with industry standard frameworks but like how we're going to do it here and how it fits into
> [35:47] **Others:** everything um so that that that would be a nice piece to have uh just summarizing okrs i have these
> [35:56] **Others:** very detailed um of of what we're doing these honestly it for you guys like i think it's just
> [36:03] **Others:** good to understand and why decisions are being made and and like stuff is but this is what we're
> [36:10] **Others:** driving towards right what i'm being measured on
> [36:13] **Others:** at the end of the day i think it's really important to look at it at four levels technology process
> [36:17] **Others:** people and the art of the possible um i think from technology again i i all this summarizes
> [36:24] **Others:** to governance and uh cost savings and the cost savings will come naturally like we're already
> [36:30] **Others:** starting to see that by what we're doing on the platform um but you know closing that gap having
> [36:37] **Others:** more visibility control over of uh how ai is being built here uh not what is being built right we want
> [36:43] **Others:** everyone to build it's just a matter of like okay we have things in place and again it ties to the
> [36:47] **Others:** governance side um so the from a people perspective uh this has changed uh from number of people i
> [36:56] **Others:** would expect uh my um function to grow uh by 20 27 20 plus people um especially from like sre ai ops
> [37:07] **Others:** need to meet with um mr dixon talk about that i want to um
> [37:13] **Others:** see what we can offload um to them um from enterprise tooling and also like our stuff
> [37:20] **Others:** gateway etc um and i think art of the possible right one spine technology the taxonomy um some
> [37:30] **Others:** core sources right um and we have a way to scale ontology across uh in the knowledge layer across
> [37:40] **Others:** every bu at vandal
> [37:43] **Others:** um this is just again calling out what we're we're not um doing same stuff you heard before
> [37:51] **Others:** not really if we build apps it's for ourselves but we're not you know platform team right this team
> [37:57] **Others:** ai platform team is not going to build like apps for the business um uh we um oh we don't own like
> [38:06] **Others:** the source data um building most reference architecture layers um
> [38:13] **Others:** that's really kind of a maturity thing i think ideally what we would like to do because um
> [38:20] **Others:** people have a lot of the really good talent and skills in this group and with conrad's
> [38:26] **Others:** team you know having some sort of uh architecture review like it's no different than anything else
> [38:33] **Others:** it's just very ai related um and uh to understand just to help them that's really how i look at it
> [38:43] **Others:** hey have you thought about doing it this way we've seen this before um you know here's how you
> [38:48] **Others:** actually can do evals like what ramsay's saying like help part of like educating um so um yeah
> [38:55] **Others:** um that is that's it man standardize the core differentiate at the edge that is um
> [39:06] **Others:** yeah not already this is already this was like a couple weeks ago and uh all of it's been you know
> [39:14] **Others:** kind of agreed upon so um questions comments concerns you hate it you love it
> [39:21] **Others:** this is awesome yeah okay um i had a quick question to answer i think uh in the
> [39:28] **Others:** not what we're not doing you said uh not uh kind of fully owning the open weight small strategy
> [39:36] **Others:** but i think in your i thought in the your 30 60 90 day plan and the 20 27 plan you have the open
> [39:44] **Others:** weight small strategy and you have the open weight small strategy and you have the open weight small
> [39:44] **Others:** goal to get 200 open weights uh if possible yeah what's your thought on that one yeah yeah yeah so
> [39:53] **Others:** like not owning the full strategy because there's going to be multiple business units involved in
> [39:58] **Others:** that right like especially security and that's i would say first and foremost it would be them
> [40:04] **Others:** um so like in the beginning we'll own from like you know ai like what like what we should
> [40:14] **Others:** do because i think there's a lot of like people don't really know what to do right like they know
> [40:19] **Others:** that you can pull it but they don't understand the learning frameworks or how do you actually
> [40:24] **Others:** fine-tune where do we start from a bu how do we scale this so we can route to it like that all
> [40:30] **Others:** falls on it like that's all the stuff that like i would own um but like the the the uh llm ops and
> [40:38] **Others:** i'm just using llm ops as a industry standard but it's you can call it gen ai ops i don't really
> [40:43] **Others:** care
> [40:44] **Others:** you know um like that we would own but like you know anything it needs to be more of a partnership
> [40:50] **Others:** with that uh especially with security in the beginning right and then i can say another one
> [40:58] **Others:** would be like you know it's my understanding and i've yet to make my rounds across the business
> [41:03] **Others:** which i will be focusing on very soon but i guarantee there well i know there is um in some
> [41:12] **Others:** conversations very very sensitive data here um
> [41:15] **Others:** that uh people will not ship out of their environments uh no it could be on frame i
> [41:22] **Others:** have no idea right uh the point is is they would own the strategy it's part of the strategy for
> [41:29] **Others:** open weight there right and like and we can help with the controls and the governance and the
> [41:35] **Others:** management of it but like we have to have a joint strategy together we'll have our own but then we
> [41:41] **Others:** basically we'll take it to security say hey this is what we want to do
> [41:45] **Others:** help shape like a strategy there and then you'd have like a broader but it will be different
> [41:50] **Others:** right but ours really won't change that much you know what i mean yeah yeah exactly and one other
> [41:56] **Others:** question i had was on the uh not not evals primarily but more of like what do we do about
> [42:03] **Others:** the traces is the plan we just send agent traces to uh brain crust or because i think the current
> [42:11] **Others:** set of collectors which uh you can correct me current set of collectors go to data dog right
> [42:18] **Others:** if we enable faces uh do or do we send to both or should we send just like how how does it split
> [42:27] **Others:** between data dog and brain crust from crisis perspective so that's the question yeah that
> [42:34] **Others:** before we kind of go down this path one is i i'll look at things always as like short-term
> [42:39] **Others:** medium-term long-term
> [42:41] **Others:** term is on paper and we'll always pivot most likely but like short-term to ramsey's point like
> [42:48] **Others:** ignore like ignore brain trust like if we can easily get data dog for tracing and just have
> [42:54] **Others:** it across the board just do that we'll figure out the rest you know what i mean because because
> [42:58] **Others:** brain trust is still like new we just so the example of print brain trust that has literally
> [43:03] **Others:** been handed over to platform that was run in the data team now it's been handed over i still don't
> [43:08] **Others:** have full access to control that like it's
> [43:11] **Others:** sitting in i guess uh well it's sass so that's fine but the actual ownership of it is still in
> [43:18] **Others:** flight to transition we haven't figured out that piece of it yet right so i would say if we wanted
> [43:25] **Others:** to get full tracing tool calls agents and stuff easiest path forward right now and if it's data
> [43:30] **Others:** dog just do that make sense yeah i think and also data dog will intake the um specific um
> [43:38] **Others:** motel traces
> [43:41] **Others:** um and i think that you can give it evaluations in the trace as well
> [43:45] **Others:** oh perfect um we can also kind of ship traces to two places right if we want them to just be two
> [43:53] **Others:** on both platforms i mean if it's expensive you know i think we can probably re-export it but
> [44:00] **Others:** it's always we can always do it to two places even if it has to go to vector first
> [44:04] **Others:** yeah and i would say too because like a longer play with brain trust is one of the things i do
> [44:09] **Others:** like is that they don't have to be like you know they don't have to be like you know they don't have
> [44:11] **Others:** this concept of topics which help you create your data sets to actually do more sophisticated evals
> [44:17] **Others:** now we could certainly pipe that data back to brain trust and do that right but like
> [44:21] **Others:** we'll figure out the right path i think like from my perspective again it's like
> [44:26] **Others:** you know we need to get every capability of the platform up and running and i would say like
> [44:35] **Others:** by kickoff and somewhat scalable it doesn't matter how it's done honestly like
> [44:41] **Others:** and then we'll we'll start to fine-tune like our actual platform that's really more like scale you
> [44:46] **Others:** know whether it's and i mean by like you know whether it's brain trust does this but we'll
> [44:50] **Others:** have more i think like description of like this is what the gateway is doing this is what you
> [44:56] **Others:** know initialize doing this is what brain trust is doing you know what i mean but and right now
> [45:00] **Others:** it can kind of be whatever um because we're getting it up and running yeah yeah that's it
> [45:06] **Others:** yeah and so like that's super helpful ramsey um
> [45:12] **Others:** i i think the next steps with this stuff guys is like i i can share out stuff mki i'm gonna
> [45:20] **Others:** figure out your access stuff i i might create a i don't know i'll chase it down with the identity
> [45:26] **Others:** team and see what's going on to kind of get that um i have a bigger call on well there's another
> [45:34] **Others:** thread i'm working with jerry and christian and and others on um how we handle our uh partners
> [45:42] **Others:** with this outside of fandle like our external partners and whether we ship you a laptop
> [45:48] **Others:** we provision a workspace etc but it would give you it's a much longer play because it would give you
> [45:54] **Others:** all our enterprise ai tooling and that stuff um so i'll include you in like as as someone that we
> [46:01] **Others:** care to about to be able to get you what you need um for this so
> [46:08] **Others:** jonathan i know we're at the end of time just one quick question when we talk about cost here
> [46:14] **Others:** are we talking are we talking about token consumption for the most part tokens and
> [46:18] **Others:** costs are not the same thing so that's that is a misconception one is the but to your point is
> [46:28] **Others:** that is a piece of it the other piece is like our our partner contracts uh what are they charging us
> [46:36] **Others:** right what are people spending are buying you know going to procurement and buying ai tooling
> [46:44] **Others:** or using their card their corporate cards expensing it like there's much more involved in
> [46:49] **Others:** ai cost at an enterprise but yes foundationally is exactly what you're saying um and that piece
> [46:56] **Others:** but just to be clear it's it's a lot more than that right so i understood the reason i i asked
> [47:03] **Others:** is because the token consumption is con will continue to grow as more use cases are brought
> [47:10] **Others:** on board so i mean in some cases yes maybe it may go up or it may go down but i don't know what you're
> [47:14] **Others:** saying there is a population right now where they're saying i don't know what the funding
> [47:17] **Others:** cost is or what the common cost is but how do you say there's a 20 3 10 20 year or what you're saying
> [47:22] **Others:** i think that's a very important question really because there's a lot of what they're saying
> [47:25] **Others:** about the future but i think there's a lot of other things that are going to happen at the
> [47:29] **Others:** moment so i think that the the the value of this whole kind of thing is that a lot of it is just
> [47:34] **Others:** a matter of time and where we're it's a matter of time i think the the way i see things will
> [47:38] **Others:** go let's say from one million to two million but on the other hand it may bring so much value that it
> [47:43] **Others:** The immediate thing you say throughout that presentation, open-weight models could be one running on our own hardware. That's a one-time CapEx expense, right? We have highly capable people that can operate hardware. Again, it's kind of like where we are today, all that will come into play in 2027. But right now, it's like, I know what we're over. We need to reduce this. This is even like duplicate tooling.
> [48:10] **Others:** Because in the intake, and I'm part of that RAI group that evaluates this stuff, I'm seeing so many duplicate tools that people want to use.
> [48:21] **Others:** And they're AI tools and need to figure that stuff out.
> [48:29] **Others:** But oh yeah, it's going to be interesting.
> [48:32] **Others:** The open-weight model stuff will be interesting because part of the strategy for AI platform and ops will be me figuring out who is our partner.
> [48:40] **Others:** With open-weight models, is it meta? Is it mistral?
> [48:44] **Others:** How do we, you know what I mean?
> [48:46] **Others:** Like that will come into play.
> [48:48] **Others:** So, and how we do that.
> [48:51] **Others:** So like, you know, plus we can use all this to go from open AI to anthropic and stuff and say, hey, like, you know, we're getting a better deal here.
> [49:02] **Others:** And of course, Google is going to be like, use our stuff.
> [49:06] **Others:** It's free.
> [49:08] **Others:** It's not.
> [49:09] **Others:** Never.
> [49:10] **Others:** But yeah.
> [49:12] **Others:** Anyways.
> [49:13] **Others:** Gemini is getting better.
> [49:16] **Others:** Yeah.
> [49:19] **Others:** Well, I appreciate it.
> [49:21] **Others:** I am late to my next.
> [49:24] **Others:** I think just from, again, next steps is like got to figure out, reconcile the execution plan I've developed with what's there.
> [49:32] **Others:** We need to get it all into era.
> [49:33] **Others:** We need to like formally start structuring because the teams, my biggest worry is that like, as I start to scale people.
> [49:40] **Others:** And get folks on, like, we don't have a good, you know, kind of structure in place, like to make sure that we're doing all this stuff because there's just going to be so many people and so much going on and I'm not a micromanager.
> [49:53] **Others:** I could care less if you use scrum or Kanban.
> [49:55] **Others:** I really don't care.
> [49:56] **Others:** I just, we just need to get the work done.
> [49:58] **Others:** But it's a matter of like, ideally, it's a one place that we can roll up roadmaps because honestly, that stuff is so frustrating to spend so much time, just like progress, roadmaps, audience.
> [50:10] **Others:** Yeah.
> [50:10] **Others:** Like, yeah, absolutely.
> [50:12] **Others:** I was just about to say, this is a great moment because we've just switched over to our own board where we can finally just like actually convert it to how we need to here.
> [50:22] **Others:** Do you mind, I found a couple of these on Confluence, a couple of these docs related to the 306090.
> [50:28] **Others:** Yeah.
> [50:29] **Others:** Could you send over any, just, I just want to make sure I have the final drafts of these and I can start looking at mapping these over within the Jira board and start just getting this together for you.
> [50:40] **Others:** Yeah.
> [50:40] **Others:** Can you access SharePoint?
> [50:43] **Others:** That is a great question.
> [50:46] **Others:** Sometimes yes, sometimes no.
> [50:48] **Others:** It's been, I do have a FD access, so I can access some things.
> [50:53] **Others:** I've run into some access issues, but usually we can get it resolved.
> [50:57] **Others:** Let me see if I, you guys, or anyone besides MK, feel bad for him.
> [51:08] **Others:** Let me see if you guys can access.
> [51:10] **Others:** This, I don't know where, too many screens.
> [51:15] **Others:** The interesting thing is I can access GitHub now.
> [51:18] **Others:** I've gotten access to GitHub.
> [51:20] **Others:** Oh, awesome.
> [51:22] **Others:** But that's the only thing I can access.
> [51:24] **Others:** I did want to ask, maybe Jonathan, Sam can help me and then we can kind of touch base on it.
> [51:32] **Others:** Maybe we can, if we can put together the next two to four week plan or at least two weeks plan.
> [51:38] **Others:** That's what I want to do.
> [51:39] **Others:** I need help.
> [51:40] **Others:** I need help getting this stuff into Jira.
> [51:42] **Others:** That's honestly my biggest thing.
> [51:44] **Others:** Yeah.
> [51:45] **Others:** And then we can do that.
> [51:46] **Others:** Totally.
> [51:47] **Others:** Yeah.
> [51:48] **Others:** I have access to this, to the SharePoint.
> [51:50] **Others:** Yeah, because with the target of NFL kickoff, that's like four weeks.
> [51:57] **Others:** Right.
> [51:58] **Others:** But see, that goes back to what, this is why, like, when you and I were talking and you were like, yeah, we're doing strands and then we're going to do langchain.
> [52:06] **Others:** And I'm like, no, we need to do the cloud SDK because I'm tying it.
> [52:10] **Others:** That use case.
> [52:11] **Others:** So this is why I wanted to do this stuff.
> [52:12] **Others:** So when I come to you guys and we, yeah, but I agree, we need to get this in structured.
> [52:16] **Others:** So like, hey, you know, Crispy's doing stuff on the gateway.
> [52:20] **Others:** He's not like, why is Jonathan coming and telling me that I shouldn't be doing this?
> [52:24] **Others:** And why are we, you know what I mean?
> [52:25] **Others:** It's like, no, no, no.
> [52:26] **Others:** Like, because this is why.
> [52:28] **Others:** Right.
> [52:28] **Others:** So.
> [52:30] **Others:** Cool.
> [52:31] **Others:** All right.
> [52:31] **Others:** Yeah.
> [52:31] **Others:** So, Sam, can I work with you on that then this week?
> [52:34] **Others:** Absolutely.
> [52:35] **Others:** Yeah.
> [52:35] **Others:** Let's do it.
> [52:36] **Others:** All right.
> [52:36] **Others:** Yeah.
> [52:37] **Others:** Let's, let's async offline.
> [52:38] **Others:** And.
> [52:40] **Others:** Yeah.
> [52:40] **Others:** Talk about it.
> [52:40] **Others:** Cause you'll see a couple of spreadsheets in there.
> [52:43] **Others:** And then, yeah.
> [52:44] **Others:** So.
> [52:45] **Others:** Great.
> [52:46] **Others:** Cool.
> [52:46] **Others:** All right.
> [52:47] **Others:** Thanks guys.
> [52:48] **Others:** Yep.
> [52:48] **Others:** Thank you.
> [52:48] **Others:** Later.
> [52:49] **Others:** Thank you.

