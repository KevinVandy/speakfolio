import { Link } from "@remix-run/react";
import {
  ActionIcon,
  Box,
  Flex,
  Text,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { IconEdit } from "@tabler/icons-react";
import xss from "xss";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { xssOptions } from "~/util/xssOptions";

dayjs.extend(duration);
dayjs.extend(relativeTime);

interface Props {
  showEdit?: boolean;
}

export default function ProfileCareerHistoryTimeline({ showEdit }: Props) {
  const profile = useProfileLoader();
  const { isOwnProfile } = profile;

  return (
    <Timeline
      active={
        (profile.careerHistories?.findIndex((ch) => !ch.endDate) ?? 0) + 1
      }
      bulletSize={20}
      color={profile.profileColor ?? "pink"}
      lineWidth={4}
      maw="800px"
      mx="auto"
      my="xl"
    >
      {profile.careerHistories?.map((careerHistory) => (
        <Timeline.Item
          key={careerHistory.id}
          title={
            <Flex align="center" gap="xs">
              <Title order={4} size="xl">
                {`${dayjs(careerHistory.startDate).format("MMMM YYYY")} - ${
                  careerHistory.endDate
                    ? dayjs(careerHistory.endDate).format("MMMM YYYY")
                    : "Present"
                }
            `}
              </Title>
              <Text c="dimmed" size="sm">
                {(() => {
                  const timeDiff = dayjs.duration({
                    months:
                      dayjs(careerHistory.endDate ?? new Date()).diff(
                        dayjs(careerHistory.startDate),
                        "months"
                      ) % 12,
                    years: dayjs(careerHistory.endDate ?? new Date()).diff(
                      dayjs(careerHistory.startDate),
                      "years"
                    ),
                  });

                  const years = timeDiff.years();
                  const months = timeDiff.months();

                  if (years > 0) {
                    return `${years} year${years > 1 ? "s" : ""}${
                      months > 0
                        ? ` ${months} month${months > 1 ? "s" : ""}`
                        : ""
                    }`;
                  } else {
                    return `${months} month${months > 1 ? "s" : ""}`;
                  }
                })()}
              </Text>
              {showEdit && isOwnProfile ? (
                <Tooltip label="Edit this item">
                  <ActionIcon
                    component={Link}
                    size="xs"
                    to={`/profile/${profile.username}/career/edit/history/${careerHistory.id}`}
                  >
                    <IconEdit />
                  </ActionIcon>
                </Tooltip>
              ) : null}
            </Flex>
          }
        >
          {careerHistory.company ? (
            <Text c="dimmed" mb="xs">
              {careerHistory.company}{" "}
              {careerHistory.jobTitle ? `- ${careerHistory.jobTitle}` : null}
            </Text>
          ) : null}
          <Box
            dangerouslySetInnerHTML={{
              __html: xss(careerHistory.description ?? "", xssOptions),
            }}
          />
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
