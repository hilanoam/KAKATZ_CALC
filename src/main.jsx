import logo from "./assets/logo.png";
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { SALARY_DATA } from "./salaryData";
import "./styles.css";

const money = new Intl.NumberFormat("he-IL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function unique(values) {
  return [...new Set(values.filter((v) => v !== null && v !== undefined && v !== ""))];
}

function byText(a, b) {
  return String(a).localeCompare(String(b), "he");
}

function byNumberText(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return byText(a, b);
}

function rankOrder(rank) {
  const map = { 'רס"מ 0': 0, 'רס"מ 3': 3, 'רס"מ 5': 5, מפקח: 10, פקד: 20 };
  return map[rank] ?? 999;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `${money.format(Number(value))} ₪`;
}

function formatValue(value) {
  if (typeof value === "number") return formatMoney(value);
  return value || "—";
}

function filterRows(filters) {
  return SALARY_DATA.filter((row) =>
    Object.entries(filters).every(([key, value]) => value === "" || row[key] === value)
  );
}

function SelectField({ label, value, onChange, options, disabled = false, placeholder = "בחרי אפשרות" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} disabled={disabled || options.length === 0} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={String(option)} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="check-field">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function ResultCard({ title, value, subtitle }) {
  return (
    <div className="result-card">
      <div className="result-title">{title}</div>

      <div className="result-value money-value">
        <span className="amount">{money.format(Number(value))}</span>
        <span className="shekel">₪</span>
      </div>

      {subtitle && <div className="result-subtitle">{subtitle}</div>}
    </div>
  );
}

function App() {
  const [form, setForm] = useState({
    profession: "",
    activityLevel: "",
    incentiveGroup: "",
    beforeRating: "",
    beforeRank: "",
    seniority: "",
    courseStartRating: "",
    courseStartRank: "",
    finalOfficerRank: "",
    finalRating: "",
    saboteurLevel: "מוסמך",
    isStationBefore: false,
    isStationStart: false,
    isStationFinal: false,
    includeBenefitB: false,
  });

const setField = (key, value) => {
  setForm((prev) => {
    const next = { ...prev, [key]: value };

    // אם בחרו מקצוע — נמלא אוטומטית רמת פעילות וקבוצת תמריץ
    if (key === "profession") {
      const rowsByProfession = SALARY_DATA.filter((row) => row.profession === value);

      const firstActivity =
        unique(rowsByProfession.map((row) => row.activityLevel)).sort(byText)[0] ?? "";

      const rowsByActivity = rowsByProfession.filter(
        (row) => row.activityLevel === firstActivity
      );

      const firstIncentive =
        unique(rowsByActivity.map((row) => row.incentiveGroup)).sort(byNumberText)[0] ?? "";

      next.activityLevel = firstActivity;
      next.incentiveGroup = firstIncentive;

      next.beforeRating = "";
      next.beforeRank = "";
      next.seniority = "";
      next.courseStartRating = "";
      next.courseStartRank = "";
      next.finalOfficerRank = "";
      next.finalRating = "";

      if (value !== "חבלן") {
        next.saboteurLevel = "מוסמך";
      }

      return next;
    }

    const order = [
      "activityLevel",
      "incentiveGroup",
      "beforeRating",
      "beforeRank",
      "seniority",
      "courseStartRating",
      "courseStartRank",
      "finalOfficerRank",
      "finalRating",
    ];

    const changedIndex = order.indexOf(key);

    if (changedIndex >= 0) {
      order.slice(changedIndex + 1).forEach((field) => {
        next[field] = "";
      });
    }

    return next;
  });
};

  const options = useMemo(() => {
    const professions = unique(SALARY_DATA.map((row) => row.profession)).sort(byText);

    const baseRows = filterRows({ profession: form.profession });
    const activityLevels = unique(baseRows.map((row) => row.activityLevel)).sort(byText);

    const activityRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
    });
    const incentiveGroups = unique(activityRows.map((row) => row.incentiveGroup)).sort(byNumberText);

    const incentiveRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
      incentiveGroup: Number(form.incentiveGroup) || form.incentiveGroup,
    });
    const beforeRatings = unique(incentiveRows.map((row) => row.beforeRating || "אחיד")).sort(byText);
    const beforeRanks = unique(incentiveRows.map((row) => row.beforeRank)).sort(
      (a, b) => rankOrder(a) - rankOrder(b)
    );

    const beforeRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
      incentiveGroup: Number(form.incentiveGroup) || form.incentiveGroup,
      beforeRank: form.beforeRank,
    });
    const seniorities = unique(beforeRows.map((row) => row.seniority)).sort(byNumberText);

    const seniorityRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
      incentiveGroup: Number(form.incentiveGroup) || form.incentiveGroup,
      beforeRank: form.beforeRank,
      seniority: Number(form.seniority) || form.seniority,
    });
    const courseStartRatings = unique(seniorityRows.map((row) => row.courseStartRating)).sort(byText);

    const courseRatingRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
      incentiveGroup: Number(form.incentiveGroup) || form.incentiveGroup,
      beforeRank: form.beforeRank,
      seniority: Number(form.seniority) || form.seniority,
      courseStartRating: form.courseStartRating,
    });
    const courseStartRanks = unique(courseRatingRows.map((row) => row.courseStartRank)).sort(
      (a, b) => rankOrder(a) - rankOrder(b)
    );

    const courseRankRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
      incentiveGroup: Number(form.incentiveGroup) || form.incentiveGroup,
      beforeRank: form.beforeRank,
      seniority: Number(form.seniority) || form.seniority,
      courseStartRating: form.courseStartRating,
      courseStartRank: form.courseStartRank,
    });
    const finalOfficerRanks = unique(courseRankRows.map((row) => row.finalOfficerRank)).sort(
      (a, b) => rankOrder(a) - rankOrder(b)
    );

    const finalRankRows = filterRows({
      profession: form.profession,
      activityLevel: form.activityLevel,
      incentiveGroup: Number(form.incentiveGroup) || form.incentiveGroup,
      beforeRank: form.beforeRank,
      seniority: Number(form.seniority) || form.seniority,
      courseStartRating: form.courseStartRating,
      courseStartRank: form.courseStartRank,
      finalOfficerRank: form.finalOfficerRank,
    });
    const finalRatings = unique(finalRankRows.map((row) => row.finalRating)).sort(byText);

    return {
      professions,
      activityLevels,
      incentiveGroups,
      beforeRatings,
      beforeRanks,
      seniorities,
      courseStartRatings,
      courseStartRanks,
      finalOfficerRanks,
      finalRatings,
    };
  }, [form]);

  const result = useMemo(() => {
    if (!form.finalRating) return null;

    return SALARY_DATA.find((row) =>
      row.profession === form.profession &&
      row.activityLevel === form.activityLevel &&
      row.incentiveGroup === (Number(form.incentiveGroup) || form.incentiveGroup) &&
      row.beforeRank === form.beforeRank &&
      row.seniority === (Number(form.seniority) || form.seniority) &&
      row.courseStartRating === form.courseStartRating &&
      row.courseStartRank === form.courseStartRank &&
      row.finalOfficerRank === form.finalOfficerRank &&
      row.finalRating === form.finalRating
    );
  }, [form]);

  const isSaboteur = form.profession === "חבלן";
  let beforeSalaryToShow = null;
  let startSalaryToShow = null;
  let finalSalaryToShow = null;
  let subtitle = "";

  if (result) {
    beforeSalaryToShow = result.beforeGrossWithBenefitA;
    startSalaryToShow = result.courseStartGrossWithBenefitA;

    if (form.isStationBefore && typeof beforeSalaryToShow === "number") {
      beforeSalaryToShow += 710;
    }

    if (form.isStationStart && typeof startSalaryToShow === "number") {
      startSalaryToShow += 710;
    }
    if (isSaboteur && form.saboteurLevel === "בכיר") {
      finalSalaryToShow = form.includeBenefitB
        ? result.finalGrossSeniorSaboteurWithBenefitB
        : result.finalGrossSeniorSaboteur;

      subtitle = form.includeBenefitB
        ? "כולל רמת פעילות חבלן בכיר + גמול ב׳"
        : "כולל רמת פעילות חבלן בכיר";
    } else {
      finalSalaryToShow = form.includeBenefitB
        ? result.finalGrossWithBenefitB
        : result.finalGross;

      subtitle = form.includeBenefitB ? "כולל גמול ב׳" : "ללא גמול ב׳";
    }

    if (form.isStationFinal && typeof finalSalaryToShow === "number") {
      finalSalaryToShow += 710;
      subtitle += " + תוספת תחנה 710 ₪";
    }
  }

  const canShow = Boolean(result);
  const courseAddition =
    result && typeof startSalaryToShow === "number" && typeof beforeSalaryToShow === "number"
      ? startSalaryToShow - beforeSalaryToShow
      : 0;

  const freezeAmount =
    result && typeof startSalaryToShow === "number" && typeof finalSalaryToShow === "number"
      ? Math.max(startSalaryToShow - finalSalaryToShow, 0)
      : 0;

  const paidSalary =
    result
      ? Math.max(
          beforeSalaryToShow || 0,
          startSalaryToShow || 0,
          finalSalaryToShow || 0
        )
      : 0;


  const reset = () =>
    setForm({
      profession: "",
      activityLevel: "",
      incentiveGroup: "",
      beforeRank: "",
      seniority: "",
      courseStartRating: "",
      courseStartRank: "",
      finalOfficerRank: "",
      finalRating: "",
      saboteurLevel: "מוסמך",
      beforeRating: "",
      isStationBefore: false,
      isStationStart: false,
      isStationFinal: false,
      includeBenefitB: false,
    });

  return (
    <main className="page">
      <div className="hero-content">
          <img src={logo} alt="logo" className="logo" />
          </div>
      <section className="hero">
        
          <div>
          <p className="eyebrow">מחשבון שכר</p>
          <h1>אומדן ראשוני למועמדים ליציאה לקורס קצינים</h1>
        </div>

        <button className="ghost-btn" onClick={reset}>
          איפוס
        </button>
      </section>

      <section className="layout">
        <form className="panel">
          <div className="section-title">נתוני בסיס</div>
          <div className="grid">
            <SelectField label="מקצוע" value={form.profession} onChange={(v) => setField("profession", v)} options={options.professions} />
            <SelectField label="רמת פעילות" value={form.activityLevel} onChange={(v) => setField("activityLevel", v)} options={options.activityLevels} />
            <SelectField label="קבוצת תמריץ" value={form.incentiveGroup} onChange={(v) => setField("incentiveGroup", v)} options={options.incentiveGroups} />

            {isSaboteur && (
              <SelectField
                label="סוג חבלן"
                value={form.saboteurLevel}
                onChange={(v) => setField("saboteurLevel", v)}
                options={["מוסמך", "בכיר"]}
                placeholder="בחרי סוג חבלן"
              />
            )}
          </div>

          <div className="section-title"> בתחילת קורס קצינים</div>
          <div className="grid">
            <SelectField
              label="דירוג לפני הקורס"
              value={form.beforeRating}
              onChange={(v) => setField("beforeRating", v)}
              options={options.beforeRatings}
            />
            <SelectField label='דרגת צח"ק' value={form.beforeRank} onChange={(v) => setField("beforeRank", v)} options={options.beforeRanks} />
            <SelectField label="שנות ותק" value={form.seniority} onChange={(v) => setField("seniority", v)} options={options.seniorities} />
          </div>
          <div className="checks">
            <CheckField
              label="משרת בתחנה"
              checked={form.isStationBefore}
              onChange={(v) => setField("isStationBefore", v)}
            />
          </div>

          <div className="section-title">בסיום קורס קצינים</div>
          <div className="grid">
            <SelectField label="דירוג אליו קודם" value={form.courseStartRating} onChange={(v) => setField("courseStartRating", v)} options={options.courseStartRatings} />
            <SelectField label="דרגה אליה הועלה" value={form.courseStartRank} onChange={(v) => setField("courseStartRank", v)} options={options.courseStartRanks} />
          </div>
          <div className="checks">
            <CheckField
              label="משרת בתחנה"
              checked={form.isStationStart}
              onChange={(v) => setField("isStationStart", v)}
            />
          </div>

          <div className="section-title">מינוי</div>
          <div className="grid">
            <SelectField label="דרגת סיום" value={form.finalOfficerRank} onChange={(v) => setField("finalOfficerRank", v)} options={options.finalOfficerRanks} />
            <SelectField label="דירוג בסיום" value={form.finalRating} onChange={(v) => setField("finalRating", v)} options={options.finalRatings} />
          </div>
          <div className="checks">
            <CheckField
              label="משרת בתחנה"
              checked={form.isStationFinal}
              onChange={(v) => setField("isStationFinal", v)}
            />
            </div>
            <div className="checks">
            <CheckField
              label="כולל גמול ב׳"
              checked={form.includeBenefitB}
              onChange={(v) => setField("includeBenefitB", v)}
            />
            </div>
        </form>

        <aside className="summary">
          <div className="summary-head">
            <span>תוצאה</span>
          </div>

          {canShow ? (
            <>
              <ResultCard
                title="בתחילת קורס קצינים"
                value={beforeSalaryToShow}
                subtitle={`דירוג: ${form.beforeRating || "אחיד"} | דרגה: ${form.beforeRank} | ותק: ${form.seniority} שנים | שכר ברוטו כולל גמול א׳`}
              />

              <div className="info-line">
                במהלך הקורס תתקבל תוספת על סך{" "}
                <strong>{formatMoney(courseAddition)}</strong>{" "}
                עקב העלייה בדרגה ובדירוג
              </div>

              <ResultCard
                title="בסיום קורס קצינים"
                value={startSalaryToShow}
                subtitle={`דירוג: ${form.courseStartRating} | דרגה: ${form.courseStartRank} | ותק: ${form.seniority} שנים | שכר ברוטו כולל גמול א׳`}
              />

              <div className="info-line">
                סכום ההקפאה לצורך שימור שכר:{" "}
                <strong>{formatMoney(freezeAmount)}</strong>
              </div>

              <ResultCard
                title="לאחר מינוי"
                value={finalSalaryToShow}
                subtitle={`דירוג: ${form.finalRating} | דרגה: ${form.finalOfficerRank} | שלב: ${result.finalStep ?? "—"} | ${form.includeBenefitB ? "שכר ברוטו כולל גמול ב׳" : "שכר ברוטו ללא גמול ב׳"}`}
              />

              <div className="danger-line">
                השכר יכלול הקפאה על סך {formatMoney(freezeAmount)} ברוטו
              </div>

              <div className="paid-salary">
                <span>שכר משולם בפועל:</span>
                <strong>{formatMoney(paidSalary)}</strong>
              </div>
            </>
          ) : (
            <div className="empty">
              מלא את כל השדות לפי הסדר.
            </div>
          )}
        </aside>
      </section>
      <footer className="disclaimer">
        <p>
          חישובים אלה הינם בגדר אומדן בלבד, אינם סופיים ומבוססים על נתונים משוערים בלבד שטרם נבדקו ואומתו סופית והם כפופים לשינויים.
        </p>
        <p>
          גרסה זו (גרסה 1) כוללת הסכמי שכר שניתנו בפועל עד תאריך 01.01.2026.
        </p>
        <p>
          סימולציה קובעת תבוצע בסמוך ליציאתך לקורס קצינים ע"י חשבי מח' שכר וגמלאות
        </p>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);