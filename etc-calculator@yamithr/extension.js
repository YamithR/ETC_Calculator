const { St, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function evaluateExpression(input) {
  const cleaned = String(input).replace(/,/g, '.').replace(/\s/g, '');
  if (!cleaned) return null;
  if (!/^[\d+\-*/().]+$/.test(cleaned)) return null;
  try {
    const result = eval(cleaned);
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch (e) {
    return null;
  }
}

function fmt(num) {
  return num.toFixed(2);
}

function formatDate(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
    + ' / ' + String(d.getDate()).padStart(2, '0') + '-' + _months[d.getMonth()] + '-' + d.getFullYear();
}

const INPUT_FIELDS = [
  { key: 'totalCargo', label: 'Total Cargo (MT)' },
  { key: 'loadedCargo', label: 'Loaded Cargo (MT)' },
  { key: 'trimmingCargo', label: 'Trimming Cargo (MT)' },
  { key: 'loadingRate', label: 'Loading Rate (MT/h)' },
  { key: 'stepsRemaining', label: 'Steps Remaining' },
];

const SUMMARY_ITEMS  = ['Total Cargo','Loaded Cargo','Trimming Cargo','Cargo before Intermediate','Loading Rate','Steps Remaining'];
const ETC_ITEMS      = ['Loading Time','Dead Time','Total Completion Time'];
const INT_ITEMS      = ['Loading Time before Intermediate','Intermediate Waiting Time','Total Time to Intermediate'];
const TIME_ITEMS     = ['Current Time','Estimated Intermediate Time','Estimated Unberthing Time','Underwater Inspection Time','ETC - Estimated Completion'];

const EtcButton = GObject.registerClass(
class EtcButton extends PanelMenu.Button {
  _init() {
    super._init(0.0, 'ETC Calculator', true);

    const label = new St.Label({ text: 'ETC', y_align: Clutter.ActorAlign.CENTER, style_class: 'etc-panel-btn' });
    this.add_child(label);

    this._active = false;
    this._entries = {};
    this._sections = { summary: [], etc: [], int: [], time: [] };
    this._errorLabel = null;
    this._warningLabel = null;
    this._resultContainer = null;
    this._placeholderLabel = null;

    this.menu.connect('open-state-changed', (menu, open) => {
      if (open) this._calculate();
    });

    this._buildMenu();
  }

  _buildMenu() {
    this.menu.removeAll();

    const outerBox = new St.BoxLayout({ vertical: true, style_class: 'etc-main-box' });

    const headerBox = new St.BoxLayout({ vertical: true, style_class: 'etc-header-box' });
    headerBox.add_child(new St.Label({ text: 'ETC Calculator', style_class: 'etc-header-title' }));
    headerBox.add_child(new St.Label({ text: 'Estimated Cargo Completion Time', style_class: 'etc-header-sub' }));
    outerBox.add_child(headerBox);

    INPUT_FIELDS.forEach(f => {
      const row = new St.BoxLayout({ style_class: 'etc-input-row' });
      const lbl = new St.Label({ text: f.label, y_align: Clutter.ActorAlign.CENTER });
      const entry = new St.Entry({ hint_text: '0', can_focus: true });
      row.add_child(lbl);
      row.add_child(entry);
      outerBox.add_child(row);
      this._entries[f.key] = entry;
      entry.clutter_text.connect('text-changed', () => this._calculate());
    });

    const hint = new St.Label({ text: 'Supports math: + - * / ( )', style_class: 'etc-hint' });
    outerBox.add_child(hint);

    this._errorLabel = new St.Label({ style_class: 'etc-error', visible: false });
    outerBox.add_child(this._errorLabel);

    this._warningLabel = new St.Label({ style_class: 'etc-warning', visible: false });
    outerBox.add_child(this._warningLabel);

    this._resultContainer = new St.BoxLayout({ vertical: true, visible: false });

    const secTitle = (text) => {
      const t = new St.Label({ text: text, style_class: 'etc-section-title' });
      return t;
    };

    const makeSection = (items, store, highlightIdx) => {
      const resultRows = [];
      items.forEach((item, i) => {
        const extra = i === highlightIdx ? ' etc-result-highlight' : '';
        const box = new St.BoxLayout({ style_class: 'etc-result-row' + extra });
        const lw = new St.Label({ text: item, style_class: 'etc-result-label', x_expand: true, x_align: Clutter.ActorAlign.START });
        const vw = new St.Label({ text: '', style_class: 'etc-result-value', x_align: Clutter.ActorAlign.END });
        box.add_child(lw);
        box.add_child(vw);
        this._resultContainer.add_child(box);
        resultRows.push({ box, label: lw, value: vw, item });
      });
      store.push(...resultRows);
    };

    this._resultContainer.add_child(secTitle('INPUT SUMMARY'));
    makeSection(SUMMARY_ITEMS, this._sections.summary);

    this._resultContainer.add_child(secTitle('FINAL ETC CALCULATION'));
    makeSection(ETC_ITEMS, this._sections.etc, 2);

    this._resultContainer.add_child(secTitle('INTERMEDIATE CALCULATION'));
    makeSection(INT_ITEMS, this._sections.int, 2);

    this._resultContainer.add_child(secTitle('ESTIMATED TIMES'));
    makeSection(TIME_ITEMS, this._sections.time, 4);

    outerBox.add_child(this._resultContainer);

    const scroll = new St.ScrollView({
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
    });
    scroll.add_actor(outerBox);

    const menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
    menuItem.actor.add(scroll);
    this.menu.addMenuItem(menuItem);
  }

  _setRowValue(rowStore, value) {
    rowStore.value.set_text(value);
  }

  _setSectionValues(store, values) {
    for (let i = 0; i < store.length && i < values.length; i++) {
      store[i].value.set_text(values[i]);
    }
  }

  _calculate() {
    const vals = {};
    let allValid = true;
    for (const f of INPUT_FIELDS) {
      const v = evaluateExpression(this._entries[f.key].get_text());
      if (v === null) { allValid = false; break; }
      vals[f.key] = v;
    }

    this._errorLabel.hide();
    this._warningLabel.hide();

    if (!allValid) {
      this._resultContainer.hide();
      return;
    }

    const { totalCargo, loadedCargo, trimmingCargo, loadingRate, stepsRemaining: stepsRaw } = vals;

    if (loadingRate <= 0) {
      this._errorLabel.text = 'Error: Loading Rate must be greater than zero.';
      this._errorLabel.show();
      this._resultContainer.hide();
      return;
    }
    if (loadedCargo > totalCargo) {
      this._errorLabel.text = 'Error: Loaded Cargo cannot be greater than Total Cargo.';
      this._errorLabel.show();
      this._resultContainer.hide();
      return;
    }
    if (trimmingCargo < 0) {
      this._errorLabel.text = 'Error: Trimming Cargo cannot be negative.';
      this._errorLabel.show();
      this._resultContainer.hide();
      return;
    }
    if (trimmingCargo > totalCargo) {
      this._errorLabel.text = 'Error: Trimming Cargo cannot be greater than Total Cargo.';
      this._errorLabel.show();
      this._resultContainer.hide();
      return;
    }

    const steps = Math.round(stepsRaw);
    if (steps < 1 || Math.abs(stepsRaw - steps) > 0.0001) {
      this._errorLabel.text = 'Error: Steps Remaining must be an integer >= 1.';
      this._errorLabel.show();
      this._resultContainer.hide();
      return;
    }

    const cargoBeforeIntermediate = totalCargo - trimmingCargo;
    if (cargoBeforeIntermediate < loadedCargo) {
      this._warningLabel.text = 'Warning: Intermediate point already passed.\nCargo before Intermediate: ' + fmt(cargoBeforeIntermediate) + ' MT  |  Current Loaded: ' + fmt(loadedCargo) + ' MT';
      this._warningLabel.show();
      this._resultContainer.hide();
      return;
    }

    const loadingTime = (totalCargo - loadedCargo) / loadingRate;
    const deadTime = ((steps * 10) / 60) + 1;
    const totalCompletionTime = loadingTime + deadTime;
    const loadingTimeBeforeIntermediate = (cargoBeforeIntermediate - loadedCargo) / loadingRate;
    const intermediateWaitingTime = ((steps - 1) * 10) / 60;
    const timeToIntermediate = loadingTimeBeforeIntermediate + intermediateWaitingTime;

    const now = Date.now();
    const completionMs = totalCompletionTime * 3600 * 1000;
    const intermediateMs = timeToIntermediate * 3600 * 1000;
    const etcTs = now + completionMs;
    const intTs = now + intermediateMs;
    const unberthTs = intTs + (4 * 3600 * 1000);
    const inspectTs = intTs + (6 * 3600 * 1000);

    this._setSectionValues(this._sections.summary, [
      fmt(totalCargo) + ' MT',
      fmt(loadedCargo) + ' MT',
      fmt(trimmingCargo) + ' MT',
      fmt(cargoBeforeIntermediate) + ' MT',
      fmt(loadingRate) + ' MT/h',
      String(steps),
    ]);

    this._setSectionValues(this._sections.etc, [
      fmt(loadingTime) + ' hours',
      fmt(deadTime) + ' hours',
      fmt(totalCompletionTime) + ' hours',
    ]);

    this._setSectionValues(this._sections.int, [
      fmt(loadingTimeBeforeIntermediate) + ' hours',
      fmt(intermediateWaitingTime) + ' hours',
      fmt(timeToIntermediate) + ' hours',
    ]);

    this._setSectionValues(this._sections.time, [
      formatDate(now),
      formatDate(intTs),
      formatDate(unberthTs),
      formatDate(inspectTs),
      formatDate(etcTs),
    ]);

    this._resultContainer.show();
  }
});

let _indicator = null;

function init() {
}

function enable() {
  _indicator = new EtcButton();
  Main.panel.addToStatusArea('etc-calculator-indicator', _indicator, 1, 'right');
}

function disable() {
  if (_indicator) {
    _indicator.destroy();
    _indicator = null;
  }
}
