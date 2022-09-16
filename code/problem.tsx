// @ts-nocheck
import {
  useGetCustomerQuery,
  useGetFormOptionsQuery,
  useUpdateCustomerMutation,
} from "@generated";
import {
  Box,
  Button,
  LoadingSpinner,
  Typography,
} from "@example/components";
import React, { useMemo } from "react";
import { Form } from "react-final-form";

import { ResidenceFieldsFeature } from "@features";
import { useNotificationContext } from "@providers";
import { NotificationType, UUID } from "@types";
import { extractNonNullItems } from "@utils";

import { settingsWording } from "../../types";

interface Props {
  customerUuid: UUID;
}

export const EditResidenceContainer = ({
  customerUuid,
}: Props) => {
  const { showNotification } = useNotificationContext();
  const { data: formOptionsData } =
    useGetFormOptionsQuery();
  const subdivisionOptions = extractNonNullItems(
    formOptionsData?.formOptions?.subdivisions
  );
  const countryOptions = extractNonNullItems(
    formOptionsData?.formOptions?.countries
  );

  // Query
  const { data, loading } = useGetCustomerQuery({
    variables: {
      customerUuid,
    },
    skip: !customerUuid,
  });

  // Mutation
  const [updateCustomer] = useUpdateCustomerMutation({
    onError: () => {
      showNotification(
        NotificationType.Error,
        settingsWording.errorUpdatingResidence
      );
    },
    onCompleted: () => {
      showNotification(
        NotificationType.Success,
        settingsWording.successUpdatingResidence
      );
    },
  });

  const handleFormSubmit = (payload) => {
    return updateCustomer({
      variables: {
        uuid: customerUuid,
        payload: {
          country: payload.country.value,
          subdivision:
            payload.country.value === "US"
              ? payload.subdivision?.value
              : null,
          city: payload.city || undefined,
        },
      },
    });
  };

  const customer = data?.customer;

  const initialFormValues = useMemo(() => {
    if (!customer) {
      return {
        country: null,
        subdivision: null,
      };
    }

    const country = customer.country,
      subdivision = customer.subdivision;

    return {
      country:
        (country &&
          countryOptions.find(
            (option) => option.value === country
          )) ??
        null,
      subdivision:
        (subdivision &&
          subdivisionOptions.find(
            (option) => option.value === subdivision
          )) ??
        null,
      city: customer.city,
    };
  }, [customer, countryOptions, subdivisionOptions]);

  if (loading || !customer) {
    return (
      <Box mx="auto">
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Form
      onSubmit={handleFormSubmit}
      initialValues={initialFormValues}
    >
      {({ form, handleSubmit }) => {
        const { submitting: isSubmitting, dirty: isDirty } =
          form.getState();

        return (
          <Box
            sx={{
              px: [3, 0],
              maxWidth: {
                xs: "100%",
                sm: "50%",
                md: "33%",
              },
            }}
          >
            <Typography variant="h2" marginBottom={5}>
              {settingsWording.residence}
            </Typography>
            <ResidenceFieldsFeature
              fullWidth={false}
              countries={countryOptions}
              subdivisions={subdivisionOptions}
              onUpdate={form.change}
              labels={{
                country: settingsWording.yourCurrentCountry,
                state: settingsWording.yourCurrentState,
              }}
            />
            <Box marginTop={4}>
              <Button
                trackingId={settingsWording.save}
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={!isDirty}
                isLoading={isSubmitting}
                sx={{ width: ["100%", "auto"] }}
              >
                {settingsWording.save}
              </Button>
            </Box>
          </Box>
        );
      }}
    </Form>
  );
};
