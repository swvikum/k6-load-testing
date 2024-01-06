const get_registration_query = 'query getRegistration($code: String!, $role: SeasonRegistrationUserType, $skipTenantConfig: Boolean!) {\n registrationSettings(code: $code) {\n ... on DiscoverRegistration {\n id\n type\n registrationCode\n startDate {\n date\n time\n timezone\n __typename\n }\n endDate {\n date\n time\n timezone\n __typename\n }\n season {\n ... on DiscoverSeason {\n id\n name\n competition {\n id\n name\n organisation {\n ...RegistrationOrganisationDetails\n __typename\n }\n __typename\n }\n __typename\n }\n ... on ProgramSeason {\n id\n name\n program {\n id\n name\n alias\n __typename\n }\n __typename\n }\n __typename\n }\n organisation {\n id\n name\n email\n contactNumber\n websiteUrl\n address {\n id\n line1\n suburb\n postcode\n state\n country\n __typename\n }\n logo {\n sizes {\n url\n dimensions {\n width\n height\n __typename\n }\n __typename\n }\n __typename\n }\n contacts {\n id\n firstName\n lastName\n position\n email\n phone\n __typename\n }\n __typename\n }\n products(role: $role) {\n ...ProductFragment\n __typename\n }\n __typename\n }\n ... on DiscoverSocialTeamRegistration {\n id\n registrationCode\n startDate {\n date\n time\n timezone\n __typename\n }\n endDate {\n date\n time\n timezone\n __typename\n }\n season {\n id\n name\n competition {\n id\n name\n organisation {\n ...RegistrationOrganisationDetails\n __typename\n }\n __typename\n }\n __typename\n }\n grades {\n id\n name\n __typename\n }\n products {\n ...ProductFragment\n __typename\n }\n __typename\n }\n __typename\n }\n tenantConfiguration @skip(if: $skipTenantConfig) {\n ...TenantContactRolesConfiguration\n ...ExternalAccountLinking\n __typename\n }\n}\n\nfragment RegistrationOrganisationDetails on DiscoverOrganisation {\n id\n name\n email\n contactNumber\n websiteUrl\n address {\n id\n line1\n suburb\n postcode\n state\n country\n __typename\n }\n logo {\n sizes {\n url\n dimensions {\n width\n height\n __typename\n }\n __typename\n }\n __typename\n }\n contacts {\n id\n firstName\n lastName\n position\n email\n phone\n __typename\n }\n __typename\n}\n\nfragment ProductFragment on Product {\n id\n name\n description\n variants {\n id\n name\n amount {\n net\n __typename\n }\n available\n categoryPairs {\n id\n category {\n id\n name\n __typename\n }\n option {\n id\n name\n __typename\n }\n __typename\n }\n __typename\n }\n categories {\n id\n name\n options {\n id\n name\n __typename\n }\n __typename\n }\n customFields {\n id\n question\n type\n dropdownOptions {\n id\n label\n __typename\n }\n option {\n category {\n id\n __typename\n }\n option {\n id\n __typename\n }\n __typename\n }\n __typename\n }\n images {\n sizes {\n url\n dimensions {\n width\n __typename\n }\n __typename\n }\n __typename\n }\n required\n __typename\n}\n\nfragment TenantContactRolesConfiguration on TenantConfiguration {\n contactRoles {\n name\n value\n __typename\n }\n __typename\n}\n\nfragment ExternalAccountLinking on TenantConfiguration {\n externalAccountLinking {\n enabled\n __typename\n }\n __typename\n}\n'
const player_number_disabled_tenant_config_query = "query playerNumberDisabledTenantConfig {\n tenantConfiguration {\n playerNumberDisabled\n __typename\n }\n}\n"
const get_profile_query = "query getProfile {\n account {\n id\n profile {\n id\n firstName\n lastName\n email\n gender {\n value\n __typename\n }\n genderSelfDescribe\n dateOfBirth\n mobileNumber {\n countryCode {\n value\n __typename\n }\n number\n displayNumber\n __typename\n }\n preferredName\n countryOfBirth\n homeNumber\n indigenousDescent {\n value\n __typename\n }\n address {\n id\n line1\n suburb\n postcode\n state\n country\n __typename\n }\n emergencyContact {\n id\n firstName\n lastName\n email\n mobileNumber {\n countryCode {\n value\n __typename\n }\n displayNumber\n number\n __typename\n }\n relation\n __typename\n }\n guardians {\n ... on Profile {\n id\n firstName\n lastName\n email\n mobileNumber {\n countryCode {\n value\n __typename\n }\n displayNumber\n number\n __typename\n }\n address {\n id\n line1\n suburb\n postcode\n state\n country\n __typename\n }\n __typename\n }\n ... on Guardian {\n id\n firstName\n lastName\n email\n mobileNumber {\n countryCode {\n value\n __typename\n }\n displayNumber\n number\n __typename\n }\n address {\n id\n line1\n suburb\n postcode\n state\n country\n __typename\n }\n __typename\n }\n __typename\n }\n coachingAccreditation {\n id\n level {\n value\n __typename\n }\n __typename\n }\n wwc {\n id\n number\n expiryDate\n stateOfIssue\n __typename\n }\n guardianBornOverseas {\n value\n __typename\n }\n guardian1CountryOfBirth\n guardian2CountryOfBirth\n hasDisability {\n value\n __typename\n }\n disabilities {\n value\n __typename\n }\n otherDisability\n disabilityHelp\n __typename\n }\n __typename\n }\n}\n"
const get_registration_tenant_configuration_query = "query getRegistrationTenantConfiguration($registrationId: String!, $role: CustomFieldApplicableRole) {\n tenantConfiguration {\n seasonRegistration {\n coachingAccreditationConfig {\n selfSubmit\n accreditations {\n name\n value\n __typename\n }\n __typename\n }\n indigenousDescent {\n name\n value\n __typename\n }\n disabilities {\n name\n value\n __typename\n }\n __typename\n }\n countries {\n name\n value\n __typename\n }\n discloseOptions {\n name\n value\n __typename\n }\n sport {\n name\n __typename\n }\n __typename\n }\n configuration {\n supportedCountries {\n name\n alpha2Code\n mobileCountryCode\n __typename\n }\n __typename\n }\n discoverSeasonRegistration(registrationID: $registrationId) {\n id\n type\n questions {\n id\n question\n __typename\n }\n customFields(role: $role) {\n ...TextCustomFieldDetails\n ...RecursiveDropdownCustomFieldsDetails\n __typename\n }\n groups {\n id\n name\n days\n sessionCount\n gender\n startDate\n sessionStartTime\n sessionEndTime\n playingSurface {\n id\n name\n venue {\n id\n name\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n}\n\nfragment TextCustomFieldDetails on TextCustomField {\n id\n name\n required\n organisation {\n id\n name\n __typename\n }\n __typename\n}\n\nfragment RecursiveDropdownCustomFieldsDetails on DropdownCustomField {\n ...DropdownCustomFieldDetails\n dropdownOptions {\n id\n label\n customField {\n ... on TextCustomField {\n ...TextCustomFieldDetails\n __typename\n }\n ... on DropdownCustomField {\n ...DropdownCustomFieldDetails\n dropdownOptions {\n id\n label\n customField {\n ... on TextCustomField {\n ...TextCustomFieldDetails\n __typename\n }\n ... on DropdownCustomField {\n ...DropdownCustomFieldDetails\n dropdownOptions {\n id\n label\n customField {\n ... on TextCustomField {\n ...TextCustomFieldDetails\n __typename\n }\n ... on DropdownCustomField {\n ...DropdownCustomFieldDetails\n dropdownOptions {\n id\n label\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n }\n __typename\n}\n\nfragment DropdownCustomFieldDetails on DropdownCustomField {\n id\n name\n required\n organisation {\n id\n name\n __typename\n }\n __typename\n}\n"
const registration_check_query = "query RegistrationCheck($input: RegistrationCheckInput!) {\n  registrationCheck(input: $input) {\n    alreadyRegisteredToRole\n    approvedParticipantID\n    hasAffiliationChangedSinceParticipantCreation\n    transferRequest {\n      id\n      status\n      createdAt\n      sourceAffiliation {\n        id\n        club {\n          id\n          name\n          __typename\n        }\n        __typename\n      }\n      destinationClub {\n        id\n        name\n        __typename\n      }\n      season {\n        id\n        name\n        __typename\n      }\n      requestedBy\n      __typename\n    }\n    permitRequest {\n      id\n      status\n      __typename\n    }\n    __typename\n  }\n  tenantConfiguration {\n    transfers {\n      transferSettingsOwner\n      __typename\n    }\n    __typename\n  }\n}\n"

export function get_registration(http, check, headers, baseUrl, code, role) {
    const get_registration_input = {
        "code":code,
        "skipTenantConfig":false,
        "role":role
    }

    const get_registration_response = http.post(baseUrl, JSON.stringify({
        operationName: "getRegistration",
        query: get_registration_query,
        variables: get_registration_input
    }), {
      headers: headers,
      tags: {
        requestName: "getRegistration"
      }
    });

    check(get_registration_response, {
        "getRegistration has no errors": r =>  r &&
            r.status &&
            r.status === 200 &&
            r.body &&
            JSON.parse(r.body) &&
            JSON.parse(r.body).errors === undefined
    });
}

export function player_number_disabled_tenant_config(http, check, headers, baseUrl) {
    const player_number_disabled_tenant_config_input = {}

    const player_number_disabled_tenant_config_response = http.post(baseUrl, JSON.stringify({
        operationName: "playerNumberDisabledTenantConfig",
        query: player_number_disabled_tenant_config_query,
        variables: player_number_disabled_tenant_config_input
    }), {
      headers: headers,
      tags: {
        requestName: "playerNumberDisabledTenantConfig"
      }
    });

    check(player_number_disabled_tenant_config_response, {
        "playerNumberDisabledTenantConfig has no errors": r =>  r &&
            r.status &&
            (r.status === 200 ||
                r.status === 201 )&&
            r.body &&
            JSON.parse(r.body) &&
            JSON.parse(r.body).errors === undefined
    });
}

export function get_profile(http, check, headers, baseUrl) {
    const get_profile_input = {}

    const get_profile_response = http.post(baseUrl, JSON.stringify({
        operationName: "getProfile",
        query: get_profile_query,
        variables: get_profile_input
    }), {
      headers: headers,
      tags: {
        requestName: "getProfile"
      }
    });

    check(get_profile_response, {
        "getProfile has no errors": r =>  r &&
            r.status &&
            r.status === 200 &&
            r.body &&
            JSON.parse(r.body) &&
            JSON.parse(r.body).errors === undefined
    });
}

export function get_registration_tenant_configuration(http, check, headers, baseUrl, code, role) {
    const get_registration_tenant_configuration_input = {
        "registrationId":code,
        "role":role
    }

    const get_registration_tenant_configuration_response = http.post(baseUrl, JSON.stringify({
        operationName: "getRegistrationTenantConfiguration",
        query: get_registration_tenant_configuration_query,
        variables: get_registration_tenant_configuration_input
    }), {
      headers: headers,
      tags: {
        requestName: "getRegistrationTenantConfiguration"
      }
    });

    check(get_registration_tenant_configuration_response, {
        "getRegistrationTenantConfiguration has no errors": r =>  r &&
            r.status &&
            r.status === 200 &&
            r.body &&
            JSON.parse(r.body) &&
            JSON.parse(r.body).errors === undefined
    });
}

export function registration_check(http, check, headers, url, role, regCode, activityID, profileID, participantID, orgID) {
    const registration_check_input = {
        input: {
            role: role,
            registrationCode: regCode,
            activityID: activityID,
            profileID: profileID,
            participantID: participantID || undefined,
            destinationOrganisationID: orgID,
        }
    }

    const response = http.post(url, JSON.stringify({
            query: registration_check_query,
            variables: registration_check_input
        }),
        {
            headers: headers,
            tags: {
                requestName: "registrationCheck"
            }
        });

    if (!check(response, {
        "registrationCheck has no errors": r =>  r &&
            r.status &&
            r.status === 200 &&
            r.body &&
            JSON.parse(r.body) &&
            JSON.parse(r.body).errors === undefined
    })
    ) {
        console.error(`Error! registrationCheck: ${JSON.stringify(response)} `)
        return
    }
}
