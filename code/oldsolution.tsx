// @ts-nocheck
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import React from "react";

import { render, screen, within } from "@mocks";
import { useNotificationContext } from "@providers";

import { EditResidenceContainer } from "./EditResidenceContainer";

import {
  useGetCustomerQuery,
  useGetFormOptionsQuery,
  useUpdateCustomerMutation,
} from "@generated";

jest.mock("@generated");
jest.mock("@providers");

const mockUseGetFormOptionsQuery = mockFunction(
  useGetFormOptionsQuery
);
const mockUseGetCustomerQuery = mockFunction(
  useGetCustomerQuery
);
const mockUseUpdateCustomerMutation = mockFunction(
  useUpdateCustomerMutation
);
const mockUseNotificationContext = mockFunction(
  useNotificationContext
);

const countries = [
  { text: "United States", value: "US" },
  { text: "Canada", value: "CA" },
  { text: "Uganda", value: "UG" },
];
const subdivisions = [
  { text: "California", value: "US-CA" },
  { text: "New York", value: "US-NY" },
  { text: "Chicago", value: "US-CH" },
];

const onSubmit = jest.fn();
const showNotification = jest.fn();

describe("EditResidenceContainer", () => {
  beforeEach(() => {
    mockUseNotificationContext.mockReturnValue({
      showNotification,
    } as unknown as ReturnType<typeof useNotificationContext>);
    mockUseGetFormOptionsQuery.mockReturnValue({
      data: {
        formOptions: {
          countries,
          subdivisions,
        },
      },
    } as ReturnType<typeof useGetFormOptionsQuery>);
    mockUseUpdateCustomerMutation.mockReturnValue([
      onSubmit,
    ] as unknown as ReturnType<
      typeof useUpdateCustomerMutation
    >);
    mockUseGetCustomerQuery.mockReturnValue({
      data: { customer: {} },
    } as unknown as ReturnType<typeof useGetCustomerQuery>);
  });

  test("should render an empty form ", () => {
    render(<EditResidenceContainer customerUuid="uuid" />);
    expect(
      screen.getByRole("heading", {
        name: /your current country/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save/i })
    ).toBeInTheDocument();
  });

  test("should not save state if country is not US", async () => {
    const user = userEvent.setup();
    render(<EditResidenceContainer customerUuid="uuid" />);

    // enter the country
    const countryInput = within(
      screen.getByTestId("country-field")
    ).getByRole("combobox");
    await user.type(countryInput, "canada{enter}");

    // click the button
    await user.click(
      screen.getByRole("button", { name: /save/i })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      variables: {
        payload: {
          city: undefined,
          country: "CA",
          subdivision: null,
        },
        uuid: "uuid",
      },
    });

    // expect(showNotification).toHaveBeenCalled();
  });

  describe("Country is US and state is New York", () => {
    let user: UserEvent;
    beforeEach(async () => {
      user = userEvent.setup();
      render(
        <EditResidenceContainer customerUuid="uuid" />
      );

      // enter the country
      const countryInput = within(
        screen.getByTestId("country-field")
      ).getByRole("combobox");
      await user.type(countryInput, "united {enter}");

      expect(
        screen.getByRole("heading", {
          name: /your current state/i,
        })
      ).toBeInTheDocument();

      // enter state information
      const stateInput = within(
        screen.getByTestId("state-field")
      ).getByRole("combobox");
      await user.type(stateInput, "new {enter}");

      expect(
        screen.getByRole("heading", {
          name: /Do you live in New York City/i,
        })
      ).toBeInTheDocument();
    });

    test("should save city to NY by default", async () => {
      // click the button
      await user.click(
        screen.getByRole("button", { name: /save/i })
      );

      expect(onSubmit).toHaveBeenCalledWith({
        variables: {
          payload: {
            city: "NY",
            country: "US",
            subdivision: "US-NY",
          },
          uuid: "uuid",
        },
      });
    });

    test("should not save city to NY by if user does not live in NY", async () => {
      // check the no radio button
      await user.click(
        screen.getByRole("radio", { name: /no/i })
      );

      // click the button
      await user.click(
        screen.getByRole("button", { name: /save/i })
      );

      expect(onSubmit).toHaveBeenCalledWith({
        variables: {
          payload: {
            city: "none",
            country: "US",
            subdivision: "US-NY",
          },
          uuid: "uuid",
        },
      });
    });
  });
});
