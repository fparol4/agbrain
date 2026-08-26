import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FarmAreaValidator } from "@/modules/farms/area-validator";

describe("FarmAreaValidator", () => {
  it("shows neutral guidance before total area is informed", () => {
    render(<FarmAreaValidator totalArea={0} agriculturalArea={0} vegetationArea={0} />);
    expect(
      screen.getByText("Informe a área total para validar o aproveitamento do solo."),
    ).toBeVisible();
  });

  it("shows available area for a valid allocation", () => {
    render(<FarmAreaValidator totalArea={100} agriculturalArea={60} vegetationArea={30} />);
    expect(screen.getByText("10 ha disponíveis")).toBeVisible();
  });

  it("shows exceeded area for an invalid allocation", () => {
    render(<FarmAreaValidator totalArea={100} agriculturalArea={80} vegetationArea={30} />);
    expect(screen.getByText("10 ha excedentes")).toBeVisible();
  });
});
