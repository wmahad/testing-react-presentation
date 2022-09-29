// @ts-nocheck
import userEvent from "@testing-library/user-event";
import React from "react";
import { settingsWording } from "src/+settings/types";
import { AppProviders } from "src/Root";

import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@mocks";
import { NotificationType } from "@types";

import { EditResidenceContainer } from "./EditResidenceContainer";

const renderComp = () => {
  render(<EditResidenceContainer customerUuid="uuid" />, {
    wrapper: AppProviders,
  });
};

const mockShowNotification = jest.fn();

jest.mock("@providers", () => {
  const original = jest.requireActual("@providers");
  return {
    ...original,
    useNotificationContext: () => ({
      showNotification: mockShowNotification,
    }),
  };
});

describe("EditResidenceContainer", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should not save state if country is not US", async () => {
    const user = userEvent.setup();
    renderComp();
    await waitForElementToBeRemoved(() =>
      screen.getByRole("status")
    );

    // enter the country
    const countryInput = within(
      screen.getByTestId("country-field")
    ).getByRole("combobox");
    await user.type(countryInput, "uganda{enter}");

    // click the button
    await user.click(
      screen.getByRole("button", { name: /save/i })
    );

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar")
    );

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationType.Success,
      settingsWording.successUpdatingResidence
    );
  });

  test("should show error when backend throws", async () => {
    const user = userEvent.setup();
    renderComp();
    await waitForElementToBeRemoved(() =>
      screen.getByRole("status")
    );

    // enter the country
    const countryInput = within(
      screen.getByTestId("country-field")
    ).getByRole("combobox");
    await user.type(countryInput, "canada{enter}");

    // click the button
    await user.click(
      screen.getByRole("button", { name: /save/i })
    );

    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar")
    );

    expect(mockShowNotification).toHaveBeenCalledWith(
      NotificationType.Error,
      settingsWording.errorUpdatingResidence
    );
  });

  test("should render an empty form ", async () => {
    renderComp();
    await waitForElementToBeRemoved(() =>
      screen.getByRole("status")
    );
    expect(
      screen.getByRole("heading", {
        name: /your current country/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save/i })
    ).toBeInTheDocument();
  });
});
