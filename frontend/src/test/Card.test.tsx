import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

describe("Card Component", () => {
  it("renders card title and children correctly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>LabLink Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Xilinx Artix-7 FPGA</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText("LabLink Equipment")).toBeInTheDocument();
    expect(screen.getByText("Xilinx Artix-7 FPGA")).toBeInTheDocument();
  });

  it("applies enterprise design tokens and rounded-2xl class", () => {
    const { container } = render(<Card data-testid="test-card">Content</Card>);
    const cardElement = screen.getByTestId("test-card");
    expect(cardElement).toHaveClass("rounded-2xl");
  });
});
