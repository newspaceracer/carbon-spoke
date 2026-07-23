// ---------------------------------------------------------------------------
// Carbon component registry for this spoke.
//
// Importing a Carbon component's `index.js` calls customElements.define() for
// its tag(s) (e.g. cds-button, cds-table, ...). This barrel is imported ONCE
// from BaseLayout in a client <script>, so every cds-* tag used anywhere in the
// app is registered and upgrades in the browser.
//
// Carbon-first workflow: when you reach for a NEW cds-* component, add its line
// here. Keep it alphabetical. Full catalog:
//   ls node_modules/@carbon/web-components/es/components/
// ---------------------------------------------------------------------------
import '@carbon/web-components/es/components/accordion/index.js';
import '@carbon/web-components/es/components/breadcrumb/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/combo-box/index.js';
import '@carbon/web-components/es/components/combo-button/index.js';
import '@carbon/web-components/es/components/contained-list/index.js';
import '@carbon/web-components/es/components/content-switcher/index.js';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/date-picker/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/file-uploader/index.js';
import '@carbon/web-components/es/components/form-group/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/icon-indicator/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/link/index.js';
import '@carbon/web-components/es/components/menu/index.js';
import '@carbon/web-components/es/components/modal/index.js';
import '@carbon/web-components/es/components/multi-select/index.js';
import '@carbon/web-components/es/components/notification/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/progress-bar/index.js';
import '@carbon/web-components/es/components/progress-indicator/index.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import '@carbon/web-components/es/components/search/index.js';
import '@carbon/web-components/es/components/stack/index.js';
import '@carbon/web-components/es/components/structured-list/index.js';
import '@carbon/web-components/es/components/tabs/index.js';
import '@carbon/web-components/es/components/tag/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/textarea/index.js';
import '@carbon/web-components/es/components/tile/index.js';
import '@carbon/web-components/es/components/toggle/index.js';
import '@carbon/web-components/es/components/ui-shell/index.js';

// Runtime accessible-name remediation for cds-text-input / cds-radio-button /
// cds-multi-select, which ship without a working label↔control association in
// @carbon/web-components@2.59.0. Loaded last so every element is registered
// first. See src/lib/carbon-a11y.ts (upstream fix = bump the Carbon version).
import './lib/carbon-a11y';
