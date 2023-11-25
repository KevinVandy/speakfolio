import { Link, useOutlet } from "@remix-run/react";
import {
  ActionIcon,
  BackgroundImage,
  Box,
  Button,
  Flex,
  Spoiler,
  Stack,
  Text,
  Tooltip,
  TypographyStylesProvider,
} from "@mantine/core";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import xss from "xss";
import { xssOptions } from "~/util/xssOptions";

export default function ProfilePresentationsTab() {
  const outlet = useOutlet();
  const profile = useProfileLoader();
  const { isOwnProfile, presentations } = profile;

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isOwnProfile && outlet) {
    return outlet;
  }

  return (
    <Stack>
      <Flex justify="end">
        <Button
          color="green"
          component={Link}
          leftSection={<IconPlus />}
          to="new/edit"
        >
          Create New Presentation
        </Button>
      </Flex>
      {!!presentations?.length ? (
        <Carousel
          align="start"
          withIndicators
          withControls
          slideSize={"31%"}
          slideGap="xl"
        >
          {presentations.map((presentation) => (
            <Carousel.Slide>
              <BackgroundImage
                src={presentation.coverImageUrl ?? ""}
                key={presentation.id}
                h={220}
                m="xs"
                pos="relative"
                p="md"
              >
                <Text
                  truncate="end"
                  component="h4"
                  size="xl"
                  c="white"
                  maw="20ch"
                  mb="md"
                  style={{
                    textShadow:
                      "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;",
                  }}
                >
                  {presentation.title}
                </Text>
                <Spoiler maxHeight={120} showLabel="Read More" hideLabel="Hide">
                  <TypographyStylesProvider
                    style={{
                      textShadow:
                        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;",
                    }}
                    c="white"
                    dangerouslySetInnerHTML={{
                      __html: xss(presentation.abstract ?? "", xssOptions),
                    }}
                  />
                </Spoiler>
                {isOwnProfile ? (
                  <Tooltip label="Edit this presentation">
                    <ActionIcon
                      pos="absolute"
                      top={8}
                      right={8}
                      component={Link}
                      to={`${presentation.id}/edit`}
                    >
                      <IconEdit />
                    </ActionIcon>
                  </Tooltip>
                ) : null}
              </BackgroundImage>
            </Carousel.Slide>
          ))}
        </Carousel>
      ) : null}
    </Stack>
  );
}
