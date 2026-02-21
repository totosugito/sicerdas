import { useMemo } from "react";
import { EnumPeriodicGroup } from "backend/src/db/schema/table-periodic/types";
import { getElementStyle } from "../utils/element-styles";
import { useTranslation } from "react-i18next";

interface PeriodicTableLegendProps {
  theme: string;
}

export const PeriodicTableLegend = ({ theme }: PeriodicTableLegendProps) => {
  const { t } = useTranslation();

  // Define all possible element groups for the legend
  const elementGroups = useMemo(() => [
    { group: EnumPeriodicGroup.othernonmetals, labelKey: "periodicTable.periodicTable.var.othernonmetals" },
    { group: EnumPeriodicGroup.noble_gases, labelKey: "periodicTable.periodicTable.var.noble_gases" },
    { group: EnumPeriodicGroup.halogens, labelKey: "periodicTable.periodicTable.var.halogens" },
    { group: EnumPeriodicGroup.metalloids, labelKey: "periodicTable.periodicTable.var.metalloids" },
    { group: EnumPeriodicGroup.post_transition_metals, labelKey: "periodicTable.periodicTable.var.post_transition_metals" },
    { group: EnumPeriodicGroup.transition_metals, labelKey: "periodicTable.periodicTable.var.transition_metals" },
    { group: EnumPeriodicGroup.lanthanoids, labelKey: "periodicTable.periodicTable.var.lanthanoids" },
    { group: EnumPeriodicGroup.actinoids, labelKey: "periodicTable.periodicTable.var.actinoids" },
    { group: EnumPeriodicGroup.alkaline_earth_metals, labelKey: "periodicTable.periodicTable.var.alkaline_earth_metals" },
    { group: EnumPeriodicGroup.alkali_metals, labelKey: "periodicTable.periodicTable.var.alkali_metals" },
  ], []);

  return (
    <div className="grid grid-cols-3 gap-3 justify-center py-2">
      {elementGroups.map(({ group, labelKey }) => {
        const style = getElementStyle(group, theme);
        const label = t(labelKey);

        return (
          <div key={group} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded border shadow-sm"
              style={{
                backgroundColor: style.atomColor,
                borderColor: style.atomColor
              }}
            />
            <span className="text-xs text-foreground font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
};