/**
 * Features built ahead of the backend on SAMPLE data (taglines, place reviews, deal performance,
 * inventory history, event delete / via-deal sales, notification preferences, change password).
 *
 * They're hidden on integrated pages so merchants never see made-up figures. The code stays in place:
 * when a feature's endpoint ships (see docs/backend-endpoints-needed.md), wire its hook to the API and
 * drop the `SHOW_SAMPLE_FEATURES &&` guard around it. Set this to true to preview them all locally.
 */
export const SHOW_SAMPLE_FEATURES = false;
