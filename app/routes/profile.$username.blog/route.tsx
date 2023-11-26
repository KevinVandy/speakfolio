import { Link, useLoaderData, useOutlet } from "@remix-run/react";
import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import xss from "xss";
import { useProfileLoader } from "~/hooks/loaders/useProfileLoader";
import { xssOptions } from "~/util/xssOptions";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { parseXMLToJSONString } from "~/util/parseXML.server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useMediaQuery } from "@mantine/hooks";

dayjs.extend(relativeTime);

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const rssURL = "https://tkdodo.eu/blog/rss.xml";
  const rssData = await fetch(rssURL).then((res) => res.text());
  const rssJSONString = await parseXMLToJSONString(rssData);
  const blogPosts = JSON.parse(rssJSONString)?.rss?.channel?.item;
  return json(blogPosts);
}

export default function ProfileBlogTab() {
  const profile = useProfileLoader();
  const data: RSSItem[] = useLoaderData();

  const { isOwnProfile } = profile;

  console.log(data);

  return (
    <SimpleGrid mt="xl" cols={{ xs: 1, sm: 2, md: 3 }} spacing={"lg"}>
      {data.map((item) => (
        <Card
          component={Link}
          key={item.link}
          rel="noopener noreferrer"
          target="_blank"
          to={item.link}
          withBorder
          shadow="sm"
        >
          <Stack justify="space-between" h="100%">
            <Stack>
              <Title c={profile.profileColor ?? "pink"} order={4}>
                {item.title}
              </Title>
              <Text lineClamp={4}>{item.description}</Text>
            </Stack>
            <Text span ta="right" c="dimmed">
              {dayjs(item.pubDate).fromNow()}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
