import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { Company } from "../types";
import fetch from "node-fetch";
import { Buffer } from "buffer";

interface CompanyDetailsViewProps {
  company: Company;
  isLoading: boolean;
  onBack: () => void;
}

export default function CompanyDetailsView({ company, isLoading, onBack }: CompanyDetailsViewProps) {
  const addressParts: string[] = [];
  if (company.address) addressParts.push(company.address);
  if (company.postalCode && company.city) addressParts.push(`${company.postalCode} ${company.city}`);
  else if (company.city) addressParts.push(company.city);
  const formattedAddress = addressParts.join(", ");

  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "map">("overview");
  const tabOrder: Array<"overview" | "financials" | "map"> = ["overview", "financials", "map"];
  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    const previousIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    setActiveTab(tabOrder[previousIndex]);
  };

  const headerChips: string[] = [];
  if (company.isVatRegistered !== undefined) headerChips.push(company.isVatRegistered ? "MVA" : "No MVA");
  if (company.isAudited !== undefined) headerChips.push(company.isAudited ? "Audited" : "Not Audited");

  const quickLinks = [
    `[Open in Brreg](${company.bregUrl || "https://www.brreg.no"})`,
    company.organizationNumber
      ? `[Open in Proff](https://www.proff.no/selskap/${company.organizationNumber})`
      : undefined,
  ]
    .filter(Boolean)
    .join(" • ");

  // Render a simple markdown "tabs" row above the title
  const tabsRow = (
    [
      { id: "overview", title: "Overview" },
      { id: "financials", title: "Financials" },
      { id: "map", title: "Map" },
    ] as const
  )
    .map((t) => {
      const isActive = activeTab === t.id;
      const bullet = isActive ? "●" : "○";
      const label = isActive ? `**${t.title}**` : t.title;
      return `${bullet} ${label}`;
    })
    .join("   ");

  const header =
    `${tabsRow}\n\n# ${company.name}\n\n` +
    (company.organizationNumber ? `Org no.: ${company.organizationNumber}` : "") +
    (headerChips.length ? `  •  ${headerChips.map((c) => `${c}`).join("  ")}` : "") +
    (quickLinks ? `\n\n${quickLinks}` : "");

  const overviewSection = `
${company.description ? `**Stated purpose:** ${company.description}\n\n` : ""}
${company.employees ? `**Employees:** ${company.employees}\n` : ""}
${company.website ? `**Website:** ${company.website}\n` : ""}
${company.phone ? `**Phone:** ${company.phone}\n` : ""}
${company.email ? `Email: ${company.email}\n` : ""}

${
  company.accountingYear || company.revenue || company.operatingResult || company.result
    ? `
### Key KPIs
- Revenue: ${company.revenue ?? "–"}
- Operating Result: ${company.operatingResult ?? "–"}
- Net Result: ${company.result ?? "–"}
${company.accountingYear ? `- Accounting Year: ${company.accountingYear}` : ""}
`
    : ""
}

${company.lastAccountsToDate ? `Last filing: ${new Date(company.lastAccountsToDate).toLocaleDateString("no-NO")}` : ""}
`;

  const hasAnyFinancialValue = Boolean(
    company.revenue ||
      company.ebitda ||
      company.operatingResult ||
      company.result ||
      company.totalAssets ||
      company.equity ||
      company.totalDebt ||
      company.depreciation ||
      company.accountingYear,
  );

  const financialsSection = hasAnyFinancialValue
    ? `
${company.revenue ? `**Revenue:** ${company.revenue}\n` : ""}
${company.ebitda ? `**EBITDA:** ${company.ebitda}\n` : ""}
${company.operatingResult ? `**Operating Result:** ${company.operatingResult}\n` : ""}
${company.result ? `**Net Result:** ${company.result}\n` : ""}
${company.totalAssets ? `**Total Assets:** ${company.totalAssets}\n` : ""}
${company.equity ? `**Equity:** ${company.equity}\n` : ""}
${company.totalDebt ? `**Total Debt:** ${company.totalDebt}\n` : ""}
${company.depreciation ? `**Depreciation:** ${company.depreciation}\n` : ""}
${company.accountingYear ? `\n_Last accounting year_: ${company.accountingYear}` : ""}
`
    : `_No financial data available_`;

  const [mapImageUrl, setMapImageUrl] = useState<string | undefined>(undefined);
  const [mapImageDataUri, setMapImageDataUri] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    async function geocodeAndBuildMap() {
      if (activeTab !== "map" || !formattedAddress || mapImageUrl) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(formattedAddress)}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Raycast-Brreg-Search/1.0.0 (contact: support@raycast.local)" as unknown as string,
            },
          },
        );
        if (!res.ok) return;
        const json = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (cancelled || !json?.length) return;
        const { lat, lon } = json[0];
        const zoom = 14;
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        const n = Math.pow(2, zoom);
        const xTile = Math.floor(((lonNum + 180) / 360) * n);
        const yTile = Math.floor(
          ((1 - Math.log(Math.tan((latNum * Math.PI) / 180) + 1 / Math.cos((latNum * Math.PI) / 180)) / Math.PI) / 2) *
            n,
        );
        const url = `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
        setMapImageUrl(url);
        setMapImageDataUri(undefined);
      } catch {
        // ignore
      }
    }
    geocodeAndBuildMap();
    return () => {
      cancelled = true;
    };
  }, [activeTab, formattedAddress, mapImageUrl]);

  // Fetch the static map image and embed as data URI to avoid remote image load issues
  useEffect(() => {
    let cancelled = false;
    async function loadMapImage() {
      if (!mapImageUrl || mapImageDataUri) return;
      try {
        const res = await fetch(mapImageUrl);
        if (!res.ok) return;
        const arrayBuf = await res.arrayBuffer();
        if (cancelled) return;
        const b64 = Buffer.from(arrayBuf).toString("base64");
        setMapImageDataUri(`data:image/png;base64,${b64}`);
      } catch {
        // ignore
      }
    }
    loadMapImage();
    return () => {
      cancelled = true;
    };
  }, [mapImageUrl, mapImageDataUri]);

  const mapSection = `
${formattedAddress ? `Address: ${formattedAddress}\n` : ""}
[Directions](https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formattedAddress || company.name)})
${mapImageDataUri ? `\n![](${mapImageDataUri})\n` : mapImageUrl ? `\n![Tile](${mapImageUrl})\n` : formattedAddress ? "\n_Locating on map…_\n" : ""}
`;

  const markdown = `${header}\n\n---\n\n${
    activeTab === "overview" ? overviewSection : activeTab === "financials" ? financialsSection : mapSection
  }\n\n---\n*Data from Brønnøysundregistrene (The Brønnøysund Register Centre)*`;

  const renderMetadata = () => {
    if (activeTab === "overview") {
      return (
        <Detail.Metadata>
          {company.organizationNumber && (
            <Detail.Metadata.Label title="Organization Number" text={company.organizationNumber} />
          )}
          {formattedAddress && <Detail.Metadata.Label title="Address" text={formattedAddress} />}
          {company.municipality && (
            <Detail.Metadata.Label
              title="Municipality"
              text={`${company.municipality}${company.municipalityNumber ? ` (${company.municipalityNumber})` : ""}`}
            />
          )}
          {company.industry && <Detail.Metadata.Label title="Industry" text={company.industry} />}
          {company.naceCode && <Detail.Metadata.Label title="NACE Code" text={company.naceCode} />}
          {company.founded && <Detail.Metadata.Label title="Founded" text={company.founded} />}
          {company.employees && <Detail.Metadata.Label title="Employees" text={company.employees} />}
          {company.isVatRegistered !== undefined && (
            <Detail.Metadata.Label title="VAT Registered" text={company.isVatRegistered ? "Yes" : "No"} />
          )}
          {company.isAudited !== undefined && (
            <Detail.Metadata.Label title="Audited" text={company.isAudited ? "Yes" : "No"} />
          )}
          {(company.phone || company.email || company.website) && <Detail.Metadata.Separator />}
          {company.phone && <Detail.Metadata.Label title="Phone" text={company.phone} />}
          {company.email && <Detail.Metadata.Label title="Email" text={company.email} />}
          {company.website && <Detail.Metadata.Link title="Website" target={company.website} text={company.website} />}
        </Detail.Metadata>
      );
    }

    if (activeTab === "financials") {
      const hasFinancials = Boolean(
        company.accountingYear ||
          company.revenue ||
          company.operatingResult ||
          company.result ||
          company.totalAssets ||
          company.equity ||
          company.totalDebt ||
          company.ebitda ||
          company.depreciation ||
          company.isAudited !== undefined,
      );
      return (
        <Detail.Metadata>
          {hasFinancials && (
            <>
              {company.accountingYear && (
                <Detail.Metadata.Label title="Accounting Year" text={company.accountingYear} />
              )}
              {company.revenue && <Detail.Metadata.Label title="Revenue" text={company.revenue} />}
              {company.ebitda && <Detail.Metadata.Label title="EBITDA" text={company.ebitda} />}
              {company.operatingResult && (
                <Detail.Metadata.Label title="Operating Result" text={company.operatingResult} />
              )}
              {company.result && <Detail.Metadata.Label title="Net Result" text={company.result} />}
              {company.totalAssets && <Detail.Metadata.Label title="Total Assets" text={company.totalAssets} />}
              {company.equity && <Detail.Metadata.Label title="Equity" text={company.equity} />}
              {company.totalDebt && <Detail.Metadata.Label title="Total Debt" text={company.totalDebt} />}
              {company.depreciation && <Detail.Metadata.Label title="Depreciation" text={company.depreciation} />}
              {company.isAudited !== undefined && (
                <Detail.Metadata.Label title="Audited" text={company.isAudited ? "Yes" : "No"} />
              )}
            </>
          )}
        </Detail.Metadata>
      );
    }

    if (activeTab === "map") {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        formattedAddress || company.name,
      )}`;
      return (
        <Detail.Metadata>
          {formattedAddress && <Detail.Metadata.Label title="Address" text={formattedAddress} />}
          <Detail.Metadata.Link title="Directions" target={directionsUrl} text="Open in Google Maps" />
        </Detail.Metadata>
      );
    }

    return null;
  };

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      metadata={renderMetadata()}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open in Brreg" url={company.bregUrl || "https://www.brreg.no"} />
          {company.organizationNumber && (
            <Action.OpenInBrowser
              title="Open in Proff"
              url={`https://www.proff.no/selskap/${company.organizationNumber}`}
            />
          )}
          <Action.CopyToClipboard title="Copy Organization Number" content={company.organizationNumber} />
          <ActionPanel.Section title="Tabs">
            <Action
              title="Show Overview"
              onAction={() => setActiveTab("overview")}
              icon={Icon.AlignLeft}
              shortcut={{ modifiers: ["cmd"], key: "1" }}
            />
            <Action
              title="Show Financials"
              onAction={() => setActiveTab("financials")}
              icon={Icon.Coins}
              shortcut={{ modifiers: ["cmd"], key: "2" }}
            />
            <Action
              title="Show Map"
              onAction={() => setActiveTab("map")}
              icon={Icon.Map}
              shortcut={{ modifiers: ["cmd"], key: "3" }}
            />
            <Action
              title="Previous Tab"
              onAction={goToPreviousTab}
              icon={Icon.ChevronLeft}
              shortcut={{ modifiers: [], key: "backspace" }}
            />
          </ActionPanel.Section>
          {mapImageUrl && <Action.OpenInBrowser title="Open Static Map Image" url={mapImageUrl} />}
          <Action title="Go Back" onAction={onBack} shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }} />
        </ActionPanel>
      }
    />
  );
}
