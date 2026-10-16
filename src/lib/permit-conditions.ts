// The permit's APPLIED special conditions — the shared permit-conditions-${id}
// store, seeded on first read with the catalog conditions that auto-apply to this
// permit (its districts, parks, activities, sensitive species, regions, and
// associated agency permits). One loader for every surface that reads the applied
// set (PermitConditions, the application-review conditions editor).
import { permit } from '../data/permit';
import { districtKey, loadPermitConditions, savePermitConditions, type PermitCondition } from '../data/conditions';
import { parkKey } from '../data/parks';
import { derivePermitActivities } from '../data/activities';
import { derivePermitSensitiveSpecies, derivePermitRegions, derivePermitAssociatedPermits } from '../data/scope';

export const permitDistricts = permit.studyAreas.districts.map((d) => ({ name: d.name, key: districtKey(d.name) }));

export const loadAppliedConditions = (): PermitCondition[] =>
  loadPermitConditions(permit.id, {
    districtKeys: permitDistricts.map((d) => d.key),
    parkKeys: permit.studyAreas.districts.flatMap((d) => d.parks.map(parkKey)),
    activityKeys: derivePermitActivities(permit),
    speciesKeys: derivePermitSensitiveSpecies(permit),
    regionKeys: derivePermitRegions(permit),
    agencyKeys: derivePermitAssociatedPermits(permit),
  });

export const saveAppliedConditions = (list: PermitCondition[]) => savePermitConditions(permit.id, list);
