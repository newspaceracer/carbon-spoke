// Special conditions — the reviewer-authored text items that get attached to a
// permit during review. This module is the single source of truth for their
// SHAPE and their SEED inventories, plus the small prototype-local persistence
// helpers (localStorage) shared by the /special-conditions console and the
// permit's Special conditions tab.
//
// Three axes describe every catalog condition:
//   • owner     — 'hq' (headquarters) or a district key. WHO curates it (the
//                 catalog). Governs where it can be edited and how broad it is.
//   • isDefault — the BROAD auto-attach: on submission it lands on every
//                 applicable permit in the owner's scope (HQ → all; district →
//                 all in that district).
//   • parkUnits — the NARROW auto-attach (optional, independent of isDefault):
//                 lands only on permits whose study area includes a listed park.
//   • scope arrays — narrow auto-attach (optional): parkUnits, activities,
//                 sensitiveSpecies, regions, associatedPermits. Each lands the
//                 condition on permits matching that dimension; ALL combine as OR
//                 (any one match triggers). See scope.ts for the last three (they
//                 are derived from the permit's LOCATION + application answers).
// A condition can use none (manual — a reviewer pulls it in) or any combination.
//
// `source` records WHY an applied condition is on a permit:
//   'default'   : broad auto-attach (isDefault)
//   'scoped'    : narrow auto-attach (park-unit match)
//   'inventory' : pulled from a reusable catalog by a reviewer
//   'custom'    : typed once for this permit (rich text)
//
// Inventories are the reusable CATALOGS (per owner). A permit holds the APPLIED
// subset. Mock content is invented + domain-credible (house no-real-data rule).
import { districtDirectory } from './district';
import { parks, parkById, parkKey } from './parks';

export type ConditionOwner = 'hq' | string; // 'hq' or a district key
export type ConditionSource = 'default' | 'scoped' | 'inventory' | 'custom';

/** A reusable catalog item living in one owner's inventory. A condition IS its
 *  text — there is no name, title, or short label; the body is the whole thing.
 *  Pickers and tables identify an item by a plain-text preview of that body. */
export interface ConditionInventoryItem {
  id: string;
  owner: ConditionOwner;
  /** The condition text as sanitized rich-text HTML — the entire condition. */
  body: string;
  /** Auto-attach to EVERY applicable permit the moment it enters review
   *  (HQ → every application; a district → every application in that district). */
  isDefault: boolean;
  /** OPTIONAL narrower auto-apply trigger, independent of `isDefault`: park-unit
   *  slugs (from `parks.ts`). When non-empty, the condition auto-attaches to a
   *  permit whose study area includes ANY listed park — so "not default, but
   *  auto-applied wherever this park is in scope." A district's items may only
   *  scope to parks in that district; HQ's may scope to any park. */
  parkUnits?: string[];
  /** OPTIONAL narrower auto-apply trigger, independent of `isDefault`: activity
   *  ids (from `activities.ts`). When non-empty, the condition auto-attaches to a
   *  permit whose field activities include ANY listed activity — so "attach the
   *  drone rules whenever the permit flies a UAS." Combines with `parkUnits` as
   *  OR (either a park OR an activity match triggers it). */
  activities?: string[];
  /** OPTIONAL scope trigger: sensitive-species ids (from `scope.ts`). Attaches
   *  when the permit's study areas host ANY listed protected species. */
  sensitiveSpecies?: string[];
  /** OPTIONAL scope trigger: region ids (from `scope.ts`). Attaches when the
   *  permit spans ANY listed region (coastal / inland / desert / sierra). */
  regions?: string[];
  /** OPTIONAL scope trigger: associated-permit ids (from `scope.ts`). Attaches
   *  when the permit relies on ANY listed underlying permit (CDFW / USFWS / NOAA). */
  associatedPermits?: string[];
  // All scope arrays combine as OR: any single dimension matching auto-attaches.
}

/** A condition as APPLIED to one permit (a snapshot, so later inventory edits
 *  never mutate an already-decided permit). */
export interface PermitCondition {
  id: string;
  owner: ConditionOwner;
  source: ConditionSource;
  /** Set when source === 'inventory' — the catalog item it came from. */
  inventoryId?: string;
  /** The condition text as sanitized rich-text HTML — the entire condition. */
  body: string;
  addedBy: string;
  addedAt: string;
}

// ── District keying ─────────────────────────────────────────────────────────
// A permit's study-area districts carry a display NAME; inventories are keyed by
// a slug. `districtKey` derives one from the other so the two surfaces agree
// (e.g. 'North Coast Redwoods District' -> 'north-coast-redwoods', matching the
// directory id).
export const districtKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ── Seed inventories ────────────────────────────────────────────────────────
const p = (s: string) => `<p>${s}</p>`;

/** HQ / headquarters catalog — the real State Parks NRD special conditions,
 *  imported from the program's master list. Bodies are the app's own sanitized
 *  rich-text HTML (p / strong / ul / ol / li / a[mailto] / br); the five
 *  truly-universal boilerplate items are flagged default so they auto-attach
 *  the moment a permit enters review. The rest are pulled in by the reviewer
 *  when the situation calls for them (park-specific, seasonal, or agency-permit
 *  conditions). */
export const hqInventory: ConditionInventoryItem[] = [
  { id: 'hq-c01', owner: 'hq', isDefault: true,
    body: "<p>This permit does not authorize access to park units, facilities, or parking lots during posted closures. California State Parks’ response to natural disasters may result in lack of access to sites identified for Scientific Research or Collection due to park closures or implementation of other safety measures. Please check for park closures through the Significant Incidents Updates page (https://www.parks.ca.gov/?page_id=30009) AND contact your permit coordinator to determine if there are other reasons that may inhibit access during this time.</p>" },
  { id: 'hq-c02', owner: 'hq', isDefault: false,
    body: "<p>The Permit Holder (and field assistants) will make every effort to minimize off-trail impacts (e.g., erosion, trampling of vegetation, and creation of volunteer trails) by utilizing formal trails and roads whenever possible. If off-trail collection is absolutely necessary, Permit Holder (and field assistants) will do so in a manner not easily visible to park visitors.</p>" },
  { id: 'hq-c03', owner: 'hq', isDefault: true,
    body: "<p>The Permit Holder (and field assistants) agrees to abide by all park rules and regulations, including, but not limited to, no-dog and dog-leash requirements, backcountry access requirements, no vehicles allowed on beaches, and posted area closures necessary to protect sensitive species, habitats, or resources.</p>" },
  { id: 'hq-c04', owner: 'hq', isDefault: false,
    body: "<p>Following sampling, and no later than [Month, Day], 2027, the Permit Holder must submit a summary report of activities conducted in the California State Park units through the <strong>California State Parks Scientific Collecting Permit Web Portal</strong> at researchpermits.parks.ca.gov</p><p>Summary reports should include survey effort details: park units sampled, sampling date(s), sampling locations (lat/long), sampling method, and number of samples.</p><p>A final report and any associated data products from State Parks surveys (e.g., spreadsheets, maps and GIS products) must also be submitted via the web portal within one month of their completion.</p>" },
  { id: 'hq-c05', owner: 'hq', isDefault: false,
    body: "<p>[Remove if no parks in list below have SNPL Populations] Prior to conducting field work in coastal areas, the Permit Holder (and field assistants) will review the two following brochures, Western Snowy Plover Sharing the Beach (http://www.parks.ca.gov/pages/23071/files/ploverpdf.pdf) and Rules and Guidelines for Protecting the Snowy Plover (http://www.parks.ca.gov/pages/23071/files/flyerploverhr.pdf). Federally threatened Western Snowy Plovers are small shorebirds that nest and over winter on many Pacific Coast beaches and other coastal areas.</p>" },
  { id: 'hq-c06', owner: 'hq', isDefault: false,
    body: "<p>The Permit Holder (and field assistants) will store any food brought into State Parks in animal proof containers. Food not stored in animal-proof containers will not be unattended; coolers are not animal-proof when left unattended. Unattended food may attract ravens, crows, jays, bears, mountain lions, and other wildlife. “Food” includes spices and condiments as well as raw or prepared food. Food scraps and trash will be deposited in animal-proof trash cans or removed from the site if trash cans become full.</p>" },
  { id: 'hq-c07', owner: 'hq', isDefault: true,
    body: "<p>The Permit Holder will acknowledge the participation of California Department of Parks &amp; Recreation in any reports or presentations from the data collected on Parks lands.</p>" },
  { id: 'hq-c08', owner: 'hq', isDefault: false,
    body: "<p>The Permit Holder is responsible for obtaining any additional permits or approvals required for research and collecting activities conducted beyond the California State Park System boundaries.</p>" },
  { id: 'hq-c09', owner: 'hq', isDefault: true,
    body: "<p>The Permit Holder (and field assistants) must carry a copy of this permit at all times while conducting field work.</p>" },
  { id: 'hq-c10', owner: 'hq', isDefault: true,
    body: "<p>This California State Park Permit does not authorize collection of rare, threatened, or endangered species protected by California law, nor does it authorize targeted collection of federally-listed species.</p>" },
  { id: 'hq-c11', owner: 'hq', isDefault: false,
    body: "<p>This Scientific Collection Permit functions as a landbase access agreement between California State Parks and the Permit Holder, whereby access is only allowed given the acceptance of permit conditions and liability framework.</p>" },
  { id: 'hq-c12', owner: 'hq', isDefault: false,
    associatedPermits: ['cdfw-scp', 'usfws', 'noaa-mou'],
    body: "<p>All research and collecting activities conducted under your California State Park permit must be consistent with the terms and conditions of your [California Department of Fish and Wildlife permit (CDFW) / National Oceanic and Atmospheric Administration (NOAA) Stranding agreement / U.S. Fish and Wildlife Service (USFWS) salvage permit] and local restrictions applied by the district permit coordinator as they retain final approval authority in all of their park units.</p>" },
  { id: 'hq-c13', owner: 'hq', isDefault: false,
    body: "<p>The CDFW Scientific Collecting Permit submitted to support this State Parks Scientific Collecting Permit is currently being amended to include the Van Damme State Park location. Once the updated permit is obtained, Permit Holder will submit it to nrd.research@parks.ca.gov. No collection shall occur at Van Damme State Park until this permit has been submitted and receipt has been confirmed by State Parks.</p>" },
  { id: 'hq-c14', owner: 'hq', isDefault: false,
    body: "<p>Memorandum of Understanding (MOU) issued by CDFW is due to expire during the period of time when the State Park Scientific Research and Collection permit is valid. If MOU is allowed to expire, field work will cease until the renewal or communication from CDFW allowing the permittee to continue fieldwork is sent in. Renewal MOU or authorization letter from the lead agency must be submitted to nrd.research@parks.ca.gov. This Permit will be amended to reflect the permitting changes. CDFW MOU, Expiration Date (12/31/2020)</p>" },
  { id: 'hq-c15', owner: 'hq', isDefault: false,
    body: "<p>The Scientific Collecting Permit granted by CDFW and submitted to support this permit expires in August 2021. Once a renewed CDFW permit has been obtained, it is to be sent to nrd.research@parks.ca.gov. If the CDFW permit is allowed to expire, this State Parks permit will be rendered invalid and field work within State Parks must cease until a renewed CDFW permit is submitted.</p>" },
  { id: 'hq-c16', owner: 'hq', isDefault: false,
    body: "<p>The CDFW Scientific Collecting Permit that supports this State Parks Scientific Collecting Permit and allows collection of smelt and surfperch expires in December 2021. If Permit Holder wishes to continue this activity beyond December 2021, they must obtain a renewed CDFW permit, to be sent to nrd.research@parks.ca.gov. If the CDFW permit is allowed to expire, this activity must cease within State Parks until a renewed CDFW permit is submitted.</p>" },
  { id: 'hq-c17', owner: 'hq', isDefault: false,
    body: "<p>The USFWS permit that supports this SCP expires (insert date). The Permit Holder applied for USFWS permit renewal on (insert date); documentation is attached here [Attachment 1 (add \"Attachment 1\" to the documentation)]. Per USFWS permit regulations, work may continue under the expired USFWS permit while the renewal is being processed. Once the new USFWS permit is obtained, it is to be sent to nrd.research@parks.ca.gov as soon as possible.</p>" },
  { id: 'hq-c18', owner: 'hq', isDefault: false,
    body: "<p>It is the policy of the California Department of Parks and Recreation to work with the NOAA Stranding network to coordinate when, where, and how stranded marine animals will be removed. Similar coordination applies to release of rehabilitated animals on State Park lands. Permission to remove animals, salvage specimens or carcasses will be granted on a case-by-case basis and will depend upon multiple factors, such as: 1) access/logistics required, 2) animal condition (live animals), 3) anticipated importance of the specimen to the scientific community vs. allowing natural processes to take their course, 4) proximity of the carcass to sensitive species or resources, 5) availability of plover monitors to accompany the response team where applicable, 6) site conditions (e.g., salvage is discouraged during high tide and storm events), 7) time of day/urgency of response, and 8) probability of the carcass being a public nuisance, safety hazard, or people management challenge, if not removed. Further coordination is required in advance of carcass disposal or specimen accession/curation. At a minimum, please include records of animals/specimens collected with date, species, location, and disposition information for each. In addition, we ask that you make reasonable efforts to coordinate with the Coastal Observation and seabird Survey Team (COASST, info@coasst.org ) to share information on your bird salvage activities.</p>" },
  { id: 'hq-c19', owner: 'hq', isDefault: false,
    body: "<p>1) Prior to taking any action to remove a live animal, to salvage animal parts or whole carcasses, or to install protective fencing/signage, the permit Holder must notify and coordinate with the appropriate State Park District Contact (See attached State Parks district Guidelines)</p><ul><li>The following information will be provided to State Parks by The Marine Mammal Center:</li><li>Location of animal</li><li>Condition and behavior of animal</li><li>How long the animal has been observed in this condition</li><li>Any public health or safety factors</li><li>Planned removal method</li><li>Planned access route</li><li>Tidal conditions</li><li>Other relevant details</li></ul><p>The District contact retains final approval authority in all of the park units. If designated contacts cannot be reached, then access is denied until such time as contact is made. The Permit Holder will further consult with the District contact in advance for rehabilitated animal release, carcass disposal, or specimen accession/curation, as appropriate.</p>" },
  { id: 'hq-c20', owner: 'hq', isDefault: false,
    body: "<p>These activities are allowed under a CDFW authorization to continue work under an expired SCP while the renewal is being processed by CDFW, per January 13, 2020 email from Justin Dellinger. Once an updated permit is obtained from CDFW, Permit Holder will immediately submit it and any supporting documentation to nrd.research@parks.ca.gov.</p>" },
  { id: 'hq-c21', owner: 'hq', isDefault: false,
    body: "<p>CDFW Scientific Collecting Permit that supports this work has expired. A renewal application was submitted by the Permit Holder but has not been processed by CDFW as of the signing of this permit agreement. Documentation allowing continued collecting under the expired permit was provided via email from Chad Hirano dated November 3, 2023 (attached). This extension is valid until June 30, 2024. Once the full permit renewal is processed by CDFW, Permit Holder must submit it to nrd.research@parks.ca.gov as soon as possible. If no renewal is received by June 30, 2024, Permit Holder must cease work until the renewal is processed or an additional extension is obtained from CDFW.</p>" },
  { id: 'hq-c22', owner: 'hq', isDefault: false,
    regions: ['coastal'],
    body: "<p>Federally – threatened Western Snowy Plovers (Charadrius nivosus nivosus) are found on many Pacific Coast beaches year-round, and it is important that you and all project participants are aware of our plover protection measures. There may be beaches fenced off to protect nests, broods, or roosts; areas where permitted State Park monitors must accompany researchers; or particular concerns regarding access to sensitive areas and units designated as Natural Preserves. Please consult directly with the District permit contacts for special instructions. Vehicles granted access to the beach will only be allowed to drive along the intertidal zone (as defined by the area wetted by the last tide cycle and below the vegetation line) under 15 MPH. Driving above the intertidal zone is not allowed. This means that travel during high tide or during high surf conditions is not allowed. An experienced 4x4 driver is highly recommended for access to beaches.</p>" },
  { id: 'hq-c23', owner: 'hq', isDefault: false,
    body: "<p>During the Western Snowy Plover nesting season (March 1st to September 30th), a USFWS 10(a)(1)(A)–permitted biologist or a State Park plover monitor must accompany the Permit Holder (and any of his/her field assistants or volunteers) when salvaging specimens/carcasses inside symbolically fenced areas. In addition, at the discretion of the District contact, a State Park monitor or other restrictions may be required for access to unfenced plover habitat or other sensitive areas. Accompaniment guidelines and processes will vary by District based on District staffing levels and availability.</p>" },
  { id: 'hq-c24', owner: 'hq', isDefault: false,
    activities: ['scientific-diving', 'water-sampling', 'intertidal-collection'],
    body: "<p>The Permit Holder (and field assistants) agrees to clean and disinfect all field gear and equipment (in accordance with federal permit requirements / best management practices) before and after sampling in a water body to minimize the spread of invasive species, pests, and pathogens.</p>" },
  { id: 'hq-c25', owner: 'hq', isDefault: false,
    body: "<p>Decontaminate/clean soles of boots, waders, and all equipment that comes into contact with waterbodies prior to and after site visit to prevent the spread of diseases and/or importation of any invasive species.</p>" },
  { id: 'hq-c26', owner: 'hq', isDefault: false,
    body: "<p>Field gear and equipment shall be cleaned and sanitized before and after sampling to minimize the spread of pests and pathogens per California Department of Fish &amp; Wildlife Invasive Species Decontamination Protocol.</p>" },
  { id: 'hq-c27', owner: 'hq', isDefault: false,
    body: "<p>Before any seining activity is to happen in State Parks, Permit Holder will contact permit coordinator for the district to ensure avoidance of nesting plovers and other special status species. Permit coordinators’ names can be found in the Contact List for Parks, below.</p>" },
  { id: 'hq-c28', owner: 'hq', isDefault: false,
    body: "<p>The use of pitfall traps for insect collections is not permitted, except when specifically authorized by the District contact in advance.</p>" },
  { id: 'hq-c29', owner: 'hq', isDefault: false,
    body: "<p>The use of hounds to pursue, tree, or capture mountain lions is not permitted on State Parks property, unless advance written authorization is provided by the District Permit Coordinator and the District Natural Resource Program Manager.</p>" },
  { id: 'hq-c30', owner: 'hq', isDefault: false,
    body: "<p>The siting of any banding / trapping / mist netting activities must be pre-approved by the District Permit Coordinator, who will also provide guidance on ingress and egress to the chosen site.</p>" },
  { id: 'hq-c31', owner: 'hq', isDefault: false,
    body: "<p>The Permit Holder (and field assistants) will avoid trampling native plants when off trail hiking.</p>" },
  { id: 'hq-c32', owner: 'hq', isDefault: false,
    body: "<p>Beached bird surveys, carcass tagging, and other Coastal Observation and seabird Survey Team (COASST) research and collecting activities are in accordance with the United States Fish &amp; Wildlife Service (USFWS) permit. Surveyors must review the Snowy Plover Sensitivity materials outlined in COAAST's 2020 Renewal Application. Note, during Snowy Plover nesting season (March 1 to September 30th) specialized access routes, seasonal restrictions, or complete exclusion could be required in areas where sensitive resources are known to occur. At the discretion of the District contact, a State Park monitor or other restriction may be required to access plover habitat or other sensitive areas.</p>" },
  { id: 'hq-c33', owner: 'hq', isDefault: false,
    body: "<p>A USFWS 10(a)(1)(A)-permitted State Park plover monitor must accompany the Permit Holder (and any field assistants or volunteers) when salvaging specimens/carcasses inside symbolically fenced areas during the Western Snowy Plover nesting season from March 1st to September 30th. At the discretion of the District contact, a State Park monitor may be required for access to unfenced plover habitat or other sensitive areas. If the Permit holder can provide evidence that marine mammal responders have completed USFWS avoidance training for plovers and other listed species within the response area or 2)obtained other applicable USFWS regulatory approvals, a request to amend the permit relax these requirements can be submitted to nrd.research@parks.ca.gov.</p>" },
  { id: 'hq-c34', owner: 'hq', isDefault: false,
    body: "<p>Permit holder (and field assistants) will coordinate with the District permit coordinator before any salvage of animal parts or carcasses. In the case of stranded marine animals, Permit Holder will notify District staff for instruction before removing a live animal. The Permit Holder will further consult with the District contact in advance for rehabilitated animal release, carcass disposal, or specimen accession/curation, as appropriate. Beach surveyors will adhere to specialized access routes, seasonal restrictions, or area exclusions as required by District permit coordinators. Further, surveyors will seek to reduce wildlife disturbance as much as possible during all field activities.</p>" },
  { id: 'hq-c35', owner: 'hq', isDefault: false,
    sensitiveSpecies: ['marine-mammals'],
    body: "<p>The Permit Holder is responsible to abide by these rules with respect to marine mammals/sea otters. Do not disturb sea otters and other marine mammals, which are protected under the Marine Mammal Protection Act. Sea otters are also protected under the Endangered Species Act. Disturbances may interfere with behaviors important for survival. You’re too close if an animal starts to stare, fidget, or flee into the water. Give animals space, and move away at the first sign of disturbance or agitation.</p>" },
  { id: 'hq-c36', owner: 'hq', isDefault: false,
    body: "<p>All collections must be conducted near the trails or service road outside bird nesting season, February 15 - September 15 (depends on spp) in order to avoid impacts to nesting birds.</p>" },
  { id: 'hq-c37', owner: 'hq', isDefault: false,
    body: "<p>The Permit Holder will look for evidence for wildlife nests (such as woodrats or birds) at the sample locations and avoid sampling with the nests nearby (staying 100 feet away).</p>" },
  { id: 'hq-c38', owner: 'hq', isDefault: false,
    body: "<p>Many of the areas being accessed were sites of significant wildfires in recent years. Permit Holder will contact District permit coordinators in advance of collecting events for guidance accessing sites while ensuring personal safety. Permit Holder (and field assistants) will follow all safety precautions requested by District staff.</p>" },
  { id: 'hq-c39', owner: 'hq', isDefault: false,
    body: "<p>The Permit Holder agrees to maintain a roster of field participants operating under this permit. The roster should include names and organizational affiliations; signatures are not required. Any new participants must be identified, and their names and affiliations reported to nrd.research@parks.ca.gov in advance of their field activity in State Parks so that the permit record can be amended.</p>" },
  { id: 'hq-c40', owner: 'hq', isDefault: false,
    body: "<p>Tree-climbing is seasonally restricted in many areas to prevent disturbance to the federally-threatened Marbled Murrelet (Brachyramphus marmoratus), federally-threatened Northern Spotted Owl (Strix occidentalis caurina), California Spotted Owl (S.o. occidentalis), and/or other sensitive species during the breeding season.</p>" },
  { id: 'hq-c41', owner: 'hq', isDefault: false,
    body: "<p>1)The Permit Holder (and field assistants) agrees to abide by seasonal prohibitions on tree-climbing necessary to avoid disturbance to sensitive species, such as Marbled Murrelet and Spotted Owl during the breeding season. No climbing is allowed from February 1 to September 15. Exceptions may be granted if the Permit Holder can provide evidence that applicable regulatory permits or approvals have been obtained. Please contact nrd.research@parks.ca.gov to request such a permit amendment. Any observation of a suspected Spotted Owl, Barred Owl (S. varia), or other raptor nest must be reported to the District contact. Please include UTM coordinates of the nest tree, tree species, and description of type of nest (cavity or platform) as well as its approximate location within the tree’s canopy. Any observation of a suspected Marbled Murrelet nest must be reported to the District contact. Evidence of a murrelet nest may include a fecal ring around a nest cup or depression on a limb, eggshell fragments, or feathers. Please include UTM coordinates of the nest tree, tree species, and approximate height of the nest within the tree’s canopy. <br>2) Researchers will take all necessary precautions to avoid damaging or movement of existing nests discovered during the course of this study. If active nesting or defensive or alarm behaviors by coniformes or Strigiformes are detected, climbing must cease and researchers should move at least a half mile away and report the finding to the District contact. <br>3) The Permit Holder (and field assistants) will utilize rope-based techniques that do not injure the tree trunk or branches. While aloft, cambium-saving devices will be deployed to minimize disruption of sensitive living surfaces of bark and epiphytes. The Permit Holder will remove all riggings, fastenings, bolts, and any other field equipment attached to the tree trunk and canopy at the conclusion of the study, or as otherwise instructed by the District contact.<br>4) The Permit Holder (and field assistants) will address public inquires about this project during personal contact in the field in a courteous, professional manner. Climbing should be described as a scientific research permitted activity, and further questions specific to climbing activities in the park should be referred to the District contact, if possible. <br>5) The Permit Holder will describe data collection devices and other research equipment to be used in trees to the District contact. Use of unmanned aerial vehicles for remote data collection is not permitted unless specifically authorized by the District contact.</p>" },
  { id: 'hq-c42', owner: 'hq', isDefault: false,
    body: "<p>California State Park and Recreation Commission Policy IV-4 states, in part, that “filming and photographic activities in the State Park System shall not result in substantial or permanent alteration of landscape, damage or danger to wildlife, plant life, cultural resources or other resources, or unduly restrict use or access by the public”. In light of increasing impacts to redwood trees from sport-climbing and ground-level visitation, and the growing media attention paid to the tallest trees, the Permit Holder (and associates) must not take or distribute photos or videos that depict climbing activities or climbing equipment during canopy research approved under this permit; unless filming or photography of actual climbing is indispensable to achieving a stated scientific research or educational goal (and has been approved as part of the State Parks research permit application process), it is expressly prohibited in areas closed to the general public. Moreover, all commercial filming and photography are prohibited, and generally require additional special permits or approvals (Government Code § 14998 et seq.). This scientific research and collecting permit may be immediately canceled, and future permits denied, if climbing images, videos, web-castings, ads, or other media inconsistent with this permit condition are discovered.</p>" },
  { id: 'hq-c43', owner: 'hq', isDefault: false,
    body: "<p>Materials collected and curated under this permit remain the property of the State of California, Department of Parks &amp; Recreation. You are required to submit to us copies of specimen and voucher identifications, descriptions, and catalogue numbers, coordinates of sampling and fossil sites, and analytic data collected under this permit. Annual summaries describing the location and stewardship status of collections must also be submitted.</p>" },
  { id: 'hq-c44', owner: 'hq', isDefault: false,
    body: "<p>Permit Holder (and field assistants) will exercise caution when working near elephant seals and other pinnipeds, following all local regulations, and keeping a safe distance from all wildlife.</p>" },
  { id: 'hq-c45', owner: 'hq', isDefault: false,
    body: "<p>During Snowy Plover nesting season (March 1 to September 30th), all carcass and injured wildlife searches must be conducted below the wrack line. Combing through wrack, picking through kelp, and lifting driftwood are all very disturbing to beach nesting birds and should not be undertaken during the nesting season.</p>" },
  { id: 'hq-c46', owner: 'hq', isDefault: false,
    body: "<p>State Parks takes seriously the potential for wildlife diseases such as White Nose Syndrome, Rabbit Hemorrhagic Disease (RHDV2), and Avian Influenza (HPAI) to impact local wildlife populations. We require permit holders to take measures to avoid the spread of wildlife diseases in Parks. Permit holder (and field assistants) will be aware of, and report, any suspected diseased wildlife encountered during field work. If dead or diseased animals are encountered in the course of fieldwork, DO NOT TOUCH OR HANDLE them. Instead, report them directly to district staff (start with permit coordinator on contact sheet) and to CDFW. If any equipment or footwear comes into contact with dead or diseased wildlife, disinfect it with a 10% bleach solution immediately. Additional information and reporting portal are available on CDFW's wildlife mortality and disease page: https://wildlife.ca.gov/Conservation/Laboratories/Wildlife-Health/Monitoring/Mortality-Report</p>" },
  { id: 'hq-c47', owner: 'hq', isDefault: false,
    activities: ['drone-uas'],
    body: "<p>The following Special Conditions apply to all Unmanned Aircraft Systems (UAS) (drone) operations within the California State Parks System:</p><ol><li>The Permit Holder shall comply with all FAA guidelines for small UAS: https://www.faa.gov/uas/commercial_operators. Flight crews must, at minimum, include two people: Remote Pilot in Charge and Visual Observer. The Remote Pilot in Charge must carry their license on hand during all flight missions.</li><li>A list of Remote Pilot(s) in Charge and Visual Observer(s) shall be provided to the Department, which includes (if applicable): name, FAA certificate number, date of issue, expiration date, ******** OPTIONAL ********and total logged flight hours for the sUAS platform being used in flight missions.</li><li>District Superintendents retain the ultimate authority to approve or deny any or all proposed UAS operations. The Permit Holder must have all UAS activities pre-approved by the affiliated District Permit Coordinator for each Park Unit where UAS operations are intended (see attached list of contacts).</li><li>The use of UAS is prohibited within any State Wilderness, Cultural Preserve, or Natural Preserve pursuant to Title 14, California Code of Regulations, Section 4351. Exceptions may only be granted by the Director of California State Parks, upon staff recommendation and based on a minimum tool analysis.</li><li>District Permit Coordinators may provide further guidance on approved take-off and landing sites, flight parameters such as speed and Above Ground Level, known hazards, and any other district-specific conditions.</li><li>If filming for commercial purposes, California State Park and Recreation Commission Policy IV-4 states, in part, that “filming and photographic activities in the State Park System shall not result in substantial or permanent alteration of landscape, damage or danger to wildlife, plant life, cultural resources or other resources, or unduly restrict use or access by the public.” Further, commercial photography or filming within State Parks requires a permit from the California Film Commission (Cal. Code Regs. tit. 14, § 4316).</li><li>Adequate proof of insurance is a condition of permit issuance. An Optional Insurance Addendum (form DPR065A) shall be submitted to California State Parks.</li><li>UAS shall not be used to harass, pursue, haze, directly approach, or otherwise take any wildlife species, unless otherwise specified in other state (e.g., California Department of Fish and Wildlife) or federal (e.g., United States Fish and Wildlife Service, National Oceanic and Atmospheric Administration) permits/approvals attached to this State Parks Scientific Collecting Permit. Permit holder agrees to fly in a manner consistent with collecting aerial photography/imagery as pre-approved by the local District Permit Coordinator (i.e., back and forth transects at a pre-determined speed and Above Ground Level).</li></ol>" },
  { id: 'hq-c48', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Border Field SP Special Conditions</strong></p><ol><li>In the event of significant rainfall and/or failure of local wastewater infrastructure, Monument Road at Border Field SP becomes flooded with sewage-contaminated water and debris for an extended period. Contaminated water may be flowing across the road after rainfall has ceased. It is advisable to avoid driving or walking through ponded water, and to avoid entering the park following significant rainfall.</li><li>When the Park is closed, all research vehicles must be parked away from the entrance of the park, and out of sight of visiting public.</li><li>Permitted researchers may drive into the park but they may not drive on dirt routes that are wet, unstable or muddy. All water or mud should be considered to be contaminated by sewage.</li><li>The concrete crossing at the Goat Canyon Sediment Basin Complex is considered to be an acceptable access point to the park. Contaminated water and mud flows impact this area, and a high clearance vehicle is recommended. Anyone that crosses here does so at their own risk. Wash vehicles thoroughly after leaving the park to remove mud from tires and wheel wells.</li><li>Prior to permit issuance, the Permit Holder must obtain signed liability waivers from all participants (DPR65B received).</li><li>This permit does not grant permission for using Border Patrol infrastructure/roads.</li></ol>" },
  { id: 'hq-c49', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Notifications - South Sector (Border Field SP, Silver Strand SB)</strong></p><ol><li>The Person in Direct Charge of Field Work must notify the following by email at least one week prior to surveys to confirm road conditions and survey dates: Chris Peregrin (<a href=\"mailto:chris.peregrin@parks.ca.gov\">chris.peregrin@parks.ca.gov</a>), Daniel Hovorka (<a href=\"mailto:daniel.hovorka@parks.ca.gov\">daniel.hovorka@parks.ca.gov</a>), and Carrie Benner (<a href=\"mailto:carrie.benner@parks.ca.gov\">carrie.benner@parks.ca.gov</a>).</li><li>The parking lot at Border Field does not require a day pass, but the beach lots at Silver Strand do. Please provide the number of vehicles so that staff can notify the parking concessionaire. Display the attached parking pass on each vehicle dashboard.</li><li>If parking past the gate on Monument Road, please provide your vehicle make, model, and plates to Border Patrol.</li><li>ATV operation is permitted year-round for this project at Silver Strand SB and Border Field SP. To protect nesting shorebirds including Western snowy plover and California least tern, stay on hard pack/wet sand only. Avoid driving in tire tracks as plovers often use these depressions for loafing. Do not exceed speeds of 10mph and do not drive through groups of shorebirds or disturb natural features like kelp or driftwood. Parks staff may arrange for a monitor to accompany the ATV survey during nesting season March 1-Sept 15.</li></ol>" },
  { id: 'hq-c50', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Torrey Pines State Beach</strong></p><ol><li>ATV operation is permitted year-round for this project at Torrey Pines SB. Please drive on hard pack sand only, below the high tide line, and never drive through the dunes. Do not approach or drive through groups of shorebirds or kelp. Maintain low speeds and watch for pedestrians.</li><li>Drone operation for this project is permitted September 16 - February 28.</li><li>Drone operation within breeding season (March 1-September 15) requires direct approval from State Parks. Consideration will be given for flights north of the south beach parking lot only.</li><li>The Person in Direct Charge of Field Work must notify all listed contacts one week prior to surveys: Sean Homer (<a href=\"mailto:Sean.Homer@parks.ca.gov\">Sean.Homer@parks.ca.gov</a>), Dylan Hardenbrook (<a href=\"mailto:Dylan.Hardenbrook@parks.ca.gov\">Dylan.Hardenbrook@parks.ca.gov</a>), Carrie Benner (<a href=\"mailto:Carrie.Benner@parks.ca.gov\">Carrie.Benner@parks.ca.gov</a>, 619-994-4018), and Mike Hastings with Los Peñasquitos Lagoon Foundation (<a href=\"mailto:mikehastings1066@gmail.com\">mikehastings1066@gmail.com</a>).</li></ol>" },
  { id: 'hq-c51', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Torrey Pines State Natural Reserve</strong> (Lagoon Inlet East of N. Torrey Pines Road)</p><ol><li>No ATV operation.</li><li>Drone operation is permitted September 16-January 31 for this project at Torrey Pines SNR.</li><li>Drone operation within breeding season (February 1-September 15) requires express approval from State Parks. Flight altitude must be 200ft or higher,</li><li>No work is allowed during excavation of the Los Peñasquitos inlet (typically 1-2 weeks each spring); please contact Mike Hastings for schedule.</li><li>The Person in Direct Charge of Field Work must notify all listed contacts one week prior to surveys: Sean Homer (<a href=\"mailto:Sean.Homer@parks.ca.gov\">Sean.Homer@parks.ca.gov</a>), Dylan Hardenbrook (<a href=\"mailto:Dylan.Hardenbrook@parks.ca.gov\">Dylan.Hardenbrook@parks.ca.gov</a>), Carrie Benner (<a href=\"mailto:Carrie.Benner@parks.ca.gov\">Carrie.Benner@parks.ca.gov</a>, 619-994-4018), and Mike Hastings (<a href=\"mailto:mikehastings1066@gmail.com\">mikehastings1066@gmail.com</a>).</li></ol>" },
  { id: 'hq-c52', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Carlsbad State Beach, San Elijo State Beach</strong></p><ol><li>ATVs and drone operation are permitted year-round for this project at Carlsbad SB and San Elijo SB. Please drive on hard pack sand only, below the high tide line, and never drive through the dunes. Do not approach or drive through groups of shorebirds or kelp. Maintain low speeds and watch for pedestrians.</li><li>The Person in Direct Charge of Field Work must notify all listed contacts one week prior to surveys: Sean Homer (<a href=\"mailto:Sean.Homer@parks.ca.gov\">Sean.Homer@parks.ca.gov</a>), Carrie Benner (<a href=\"mailto:Carrie.Benner@parks.ca.gov\">Carrie.Benner@parks.ca.gov</a>, 619-994-4018)</li></ol>" },
  { id: 'hq-c53', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Cardiff State Beach, South Carlsbad State Beach</strong></p><ol><li>ATV operation is permitted year-round for this project. Please drive on hard pack sand only, below the high tide line, and never drive through the dunes. Do not approach or drive through groups of shorebirds or kelp. Maintain low speeds and watch for pedestrians.</li><li>Drone operation is permitted September 16 - February 28 for this project at Cardiff SB and South Carlsbad SB.</li><li>Drone operation within breeding season (March 1 - September 15) requires express approval from State Parks</li><li>The Person in Direct Charge of Field Work must notify all listed contacts one week prior to surveys: Sean Homer (<a href=\"mailto:Sean.Homer@parks.ca.gov\">Sean.Homer@parks.ca.gov</a>), Carrie Benner (<a href=\"mailto:Carrie.Benner@parks.ca.gov\">Carrie.Benner@parks.ca.gov</a>, 619-994-4018)</li></ol>" },
  { id: 'hq-c54', owner: 'hq', isDefault: false,
    body: "<p><strong>[San Diego Coast] Moonlight State Beach, Leucadia State Beach</strong> (operated by City of Encinitas)</p><ol><li>If project staff need to drive on either beach, they will obtain a no-fee Beach Encroachment Permit from the City of Encinitas engineering counter on the day of field work.</li><li>Two business days prior to field work, please contact David Brown (<a href=\"mailto:dbrown@encinitasca.gov\">dbrown@encinitasca.gov</a>). Lifeguard headquarters can be reached at 760-633-2750.</li></ol>" },
];

/** Per-district catalogs. Keyed by district slug; `name` lets the console label a
 *  district that isn't in the roster directory (e.g. Mendocino on the sample
 *  permit). Only the districts on the sample permit are populated in this
 *  prototype — the rest start empty and are built in the console. */
export const districtInventorySeeds: Record<string, { name: string; items: ConditionInventoryItem[] }> = {
  'north-coast-redwoods': {
    name: 'North Coast Redwoods District',
    items: [
      { id: 'ncr-reserve', owner: 'north-coast-redwoods', isDefault: true,
        body: p('No collection within the False Klamath Cove marine reserve boundary.') },
      { id: 'ncr-access', owner: 'north-coast-redwoods', isDefault: false,
        body: p('Intertidal access must be coordinated with the district ranger at least 48 hours in advance.') },
      { id: 'ncr-vehicles', owner: 'north-coast-redwoods', isDefault: true,
        body: p('Vehicles restricted to designated day-use lots; no driving on the beach or dunes.') },
      { id: 'ncr-pinniped', owner: 'north-coast-redwoods', isDefault: false,
        body: p('Maintain at least 100 yards from any pinniped haul-out; suspend work if animals show disturbance.') },
      // Park-scoped (not default): auto-attaches only when Prairie Creek is in the
      // permit's study area — Marbled Murrelet old-growth is unique to that unit.
      { id: 'ncr-murrelet', owner: 'north-coast-redwoods', isDefault: false,
        parkUnits: ['prairie-creek-redwoods-state-park'],
        body: p('At Prairie Creek Redwoods, seasonal old-growth closures protect nesting Marbled Murrelet; confirm access windows with the district before any canopy or off-trail work.') },
    ],
  },
  'mendocino': {
    name: 'Mendocino District',
    items: [
      { id: 'men-mhw', owner: 'mendocino', isDefault: true,
        body: p('Collection limited to rocky intertidal below the mean high-water line.') },
      { id: 'men-seal', owner: 'mendocino', isDefault: true,
        body: p('No disturbance of harbor-seal haul-out areas at MacKerricher.') },
      { id: 'men-checkin', owner: 'mendocino', isDefault: false,
        body: p('Check in with the district office before each field day and report the crew size and planned sites.') },
      // Park-scoped (not default): auto-attaches only when MacKerricher is in the
      // permit's study area.
      { id: 'men-mackerricher-dune', owner: 'mendocino', isDefault: false,
        parkUnits: ['mackerricher-state-park'],
        body: p('At MacKerricher, keep to established boardwalks and hard-pack; the foredunes and Ten Mile dune complex are closed to off-trail travel to protect nesting shorebirds.') },
    ],
  },
};

/** Districts selectable as a "district representative" scope in the console —
 *  the roster directory, plus any seeded district not in it. */
export const districtOptions: { key: string; name: string }[] = (() => {
  const opts = districtDirectory.map((d) => ({ key: d.id, name: d.name }));
  const have = new Set(opts.map((o) => o.key));
  for (const [key, seed] of Object.entries(districtInventorySeeds)) {
    if (!have.has(key)) opts.push({ key, name: seed.name });
  }
  return opts;
})();

/** Human label for an owner. */
export const ownerLabel = (owner: ConditionOwner) =>
  owner === 'hq'
    ? 'Headquarters'
    : districtOptions.find((o) => o.key === owner)?.name ??
      districtInventorySeeds[owner]?.name ??
      owner;

/** The park units an owner's condition may be SCOPED to. HQ → the whole system;
 *  a district → only its own units (parks whose administering district slugs to
 *  the owner key). Sorted by name for the picker. */
export const parksForOwner = (owner: ConditionOwner): { id: string; name: string }[] =>
  parks
    .filter((pk) => owner === 'hq' || districtKey(pk.district) === owner)
    .map((pk) => ({ id: pk.id, name: pk.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

/** Display name for a park-unit slug (falls back to the slug if unknown). */
export const parkLabel = (id: string): string => parkById.get(id)?.name ?? id;

/** The seed catalog for an owner (empty for an un-populated district). */
export const seedInventory = (owner: ConditionOwner): ConditionInventoryItem[] =>
  owner === 'hq'
    ? hqInventory.map((i) => ({ ...i }))
    : (districtInventorySeeds[owner]?.items ?? []).map((i) => ({ ...i }));

// ── Persistence (prototype-local; call ONLY from client scripts) ────────────
export const invStorageKey = (owner: ConditionOwner) =>
  owner === 'hq' ? 'sc-inv-hq' : `sc-inv-${owner}`;
export const permitConditionsKey = (permitId: string) => `permit-conditions-${permitId}`;
export const permitStatusKey = (permitId: string) => `permit-status-${permitId}`;

/** Load an owner's inventory, falling back to (and persisting) the seed. */
export function loadInventory(owner: ConditionOwner): ConditionInventoryItem[] {
  try {
    const raw = localStorage.getItem(invStorageKey(owner));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* malformed — fall through to seed */ }
  return seedInventory(owner);
}

export function saveInventory(owner: ConditionOwner, items: ConditionInventoryItem[]) {
  localStorage.setItem(invStorageKey(owner), JSON.stringify(items));
}

/** A permit's match sets across every scope dimension, passed to
 *  `loadPermitConditions`. `districtKeys` also selects which district catalogs are
 *  consulted; the rest are the values a condition's scope arrays match against. */
export interface PermitScope {
  districtKeys: string[];
  parkKeys?: string[];
  activityKeys?: string[];
  speciesKeys?: string[];
  regionKeys?: string[];
  agencyKeys?: string[];
}

/** Load a permit's applied conditions. On first access (nothing stored) seed the
 *  permit by auto-attaching, from HQ + each district on the permit, every item
 *  that is either DEFAULT (broad) OR SCOPED — matching the permit on ANY scope
 *  dimension (park, activity, sensitive species, region, associated permit). This
 *  is the "conditions auto-attach when submitted for review" behaviour. */
export function loadPermitConditions(permitId: string, scope: PermitScope): PermitCondition[] {
  try {
    const raw = localStorage.getItem(permitConditionsKey(permitId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* malformed — reseed */ }

  // Each dimension: [human label for addedBy, the condition's scope array key, the
  // permit's match set]. Order sets which label wins when several dimensions match.
  const mkSet = (a?: string[]) => new Set(a ?? []);
  const dims: [string, keyof ConditionInventoryItem, Set<string>][] = [
    ['Park', 'parkUnits', mkSet(scope.parkKeys)],
    ['Activity', 'activities', mkSet(scope.activityKeys)],
    ['Species', 'sensitiveSpecies', mkSet(scope.speciesKeys)],
    ['Region', 'regions', mkSet(scope.regionKeys)],
    ['Agency', 'associatedPermits', mkSet(scope.agencyKeys)],
  ];

  const owners: ConditionOwner[] = ['hq', ...scope.districtKeys];
  const seeded: PermitCondition[] = [];
  for (const owner of owners) {
    for (const item of loadInventory(owner)) {
      const byDefault = item.isDefault;
      let matchedDim: string | null = null;
      if (!byDefault) {
        for (const [dimLabel, key, set] of dims) {
          const vals = item[key] as string[] | undefined;
          if (vals?.some((v) => set.has(v))) { matchedDim = dimLabel; break; }
        }
      }
      if (!byDefault && !matchedDim) continue;
      seeded.push({
        id: `${item.id}--applied`,
        owner,
        source: byDefault ? 'default' : 'scoped',
        inventoryId: item.id,
        body: item.body,
        addedBy: byDefault ? 'Standard condition' : `${matchedDim}-scoped condition`,
        addedAt: 'On submission',
      });
    }
  }
  savePermitConditions(permitId, seeded);
  return seeded;
}

export function savePermitConditions(permitId: string, conditions: PermitCondition[]) {
  localStorage.setItem(permitConditionsKey(permitId), JSON.stringify(conditions));
}

// ── Small utilities shared by the client scripts ────────────────────────────
/** A unique-enough id for a newly authored condition (browser-only). */
export const newConditionId = (prefix = 'c') =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Plain-text preview of a rich-text body (for table cells / truncation). */
export const plainText = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
