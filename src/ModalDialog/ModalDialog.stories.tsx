import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { ModalDialog } from "./";
import { ModalDialogAnchor } from "./ModalDialog";

const meta: Meta<typeof ModalDialog> = {
  component: ModalDialog,
  tags: ["autodocs"],
  title: "Component/ModalDialog",
};

export default meta;
type Story = StoryObj<typeof ModalDialog>;

const TestModalDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <input type="button" value="Open" onClick={() => setIsOpen(true)} />
      <ModalDialog visible={isOpen} onClose={() => setIsOpen(false)} title="Test Dialog">
        Test
      </ModalDialog>
    </>
  );
};

export const Default: Story = {
  args: {},
  render: () => (
    <div>
      <div>Header not covered by modal dialog</div>
      <div style={{ position: "relative", height: "40px" }}>
        <ModalDialogAnchor />
        <TestModalDialog />
      </div>
    </div>
  ),
};
