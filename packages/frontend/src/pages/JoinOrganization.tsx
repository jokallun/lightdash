import { getEmailDomain } from '@lightdash/common';
import {
    Anchor,
    Avatar,
    Button,
    Card,
    Group,
    Image,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import React, { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import Page from '../components/common/Page/Page';
import PageSpinner from '../components/PageSpinner';
import { useOrganisationCreateMutation } from '../hooks/organisation/useOrganisationCreateMutation';
import useAllowedOrganizations from '../hooks/user/useAllowedOrganizations';
import { useJoinOrganizationMutation } from '../hooks/user/useJoinOrganizationMutation';
import { useApp } from '../providers/AppProvider';
import LightdashLogo from '../svgs/lightdash-black.svg';

export const JoinOrganizationPage: FC = () => {
    const { health, user } = useApp();
    const history = useHistory();
    const { isLoading: isLoadingAllowedOrgs, data: allowedOrgs } =
        useAllowedOrganizations();
    const {
        mutate: createOrg,
        isLoading: isCreatingOrg,
        isSuccess: hasCreatedOrg,
    } = useOrganisationCreateMutation();
    const {
        mutate: joinOrg,
        isLoading: isJoiningOrg,
        isSuccess: hasJoinedOrg,
    } = useJoinOrganizationMutation();
    const emailDomain = user.data?.email ? getEmailDomain(user.data.email) : '';

    useEffect(() => {
        const isAllowedToJoinOrgs = allowedOrgs && allowedOrgs.length > 0;
        const userHasOrg = user.data && !!user.data.organizationUuid;
        if (
            !isCreatingOrg &&
            !isLoadingAllowedOrgs &&
            !userHasOrg &&
            !isAllowedToJoinOrgs
        ) {
            createOrg({ name: '' });
        }
    }, [
        health,
        allowedOrgs,
        createOrg,
        isCreatingOrg,
        user,
        isLoadingAllowedOrgs,
    ]);

    useEffect(() => {
        if (hasCreatedOrg || hasJoinedOrg) {
            history.push('/');
        }
    }, [hasCreatedOrg, hasJoinedOrg]);

    if (health.isLoading || isLoadingAllowedOrgs || isCreatingOrg) {
        return <PageSpinner />;
    }

    const disabled = isCreatingOrg || isJoiningOrg;

    return (
        <Page isFullHeight>
            <Helmet>
                <title>Join a workspace - Lightdash</title>
            </Helmet>
            <Stack w={400} mt="4xl">
                <Image
                    src={LightdashLogo}
                    alt="lightdash logo"
                    width={130}
                    mx="auto"
                    my="lg"
                />
                <Card p="xl" radius="xs" withBorder shadow="xs">
                    <Stack justify="center" spacing="md" mb="xs">
                        <Title order={3} ta="center">
                            Join a workspace
                        </Title>
                        <Text color="gray.6" ta="center">
                            The workspaces below are open to anyone with a{' '}
                            <Text span fw={600}>
                                @{emailDomain}:
                            </Text>{' '}
                            domain
                        </Text>
                        {allowedOrgs?.map((org) => (
                            <Card key={org.organizationUuid} withBorder>
                                <Group position="apart">
                                    <Group spacing="md">
                                        <Avatar
                                            size="md"
                                            radius="xl"
                                            color="gray.6"
                                        >
                                            {org.name[0]?.toUpperCase()}
                                        </Avatar>
                                        <Stack spacing="two">
                                            <Text truncate fw={600}>
                                                {org.name}
                                            </Text>
                                            <Text fz="xs" c="gray">
                                                {org.membersCount} members
                                            </Text>
                                        </Stack>
                                    </Group>
                                    <Button
                                        onClick={() =>
                                            joinOrg(org.organizationUuid)
                                        }
                                        loading={isJoiningOrg}
                                    >
                                        Join
                                    </Button>
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                </Card>
                <Anchor
                    component="button"
                    onClick={() => createOrg({ name: '' })}
                    disabled={disabled}
                    ta="center"
                    size="sm"
                    sx={(theme) =>
                        disabled
                            ? {
                                  color: theme.colors.gray[6],
                                  '&:hover': {
                                      textDecoration: 'none',
                                      color: theme.colors.gray[6],
                                  },
                              }
                            : {}
                    }
                >
                    Create a new workspace
                </Anchor>
            </Stack>
        </Page>
    );
};
