// pages/community/[id].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Navbar from "@/components/navbar/Navbar";
import PostForm from "@/components/feed/PostForm";
import Post from "@/components/feed/Post";
import { PostType } from "@/types/post";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bell,
  BellOff,
  MessageSquare,
  Info,
  Calendar,
  Flame,
  TrendingUp,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Define community type
interface CommunityData {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  rules: string[];
  moderators: string[];
  banner: string;
  color: string;
}

// Type for the communities object
interface CommunitiesMap {
  [key: string]: CommunityData;
}

// Mock community data
const COMMUNITIES: CommunitiesMap = {
  democrat: {
    id: "democrat",
    name: "Democrat",
    description:
      "Discussions related to the Democratic Party, its policies, candidates, and perspectives.",
    members: 15243,
    created: "2021-06-15",
    rules: [
      "Be respectful to others",
      "No hate speech or personal attacks",
      "Stay on topic",
      "Cite sources for factual claims",
      "No misinformation",
    ],
    moderators: ["PoliticalModerator", "DemCoordinator", "BlueWave2024"],
    banner: "/images/democrat-banner.jpg", // This would be a real image in production
    color: "blue",
  },
  republican: {
    id: "republican",
    name: "Republican",
    description:
      "Discussions related to the Republican Party, its policies, candidates, and perspectives.",
    members: 14876,
    created: "2021-06-15",
    rules: [
      "Be respectful to others",
      "No hate speech or personal attacks",
      "Stay on topic",
      "Cite sources for factual claims",
      "No misinformation",
    ],
    moderators: ["ConservativeVoice", "RedWaveRider", "TraditionDefender"],
    banner: "/images/republican-banner.jpg",
    color: "red",
  },
  libertarian: {
    id: "libertarian",
    name: "Libertarian",
    description:
      "Discussion forum for libertarian politics, philosophy, debates, and news.",
    members: 8932,
    created: "2021-08-22",
    rules: [
      "Respect individual rights and opinions",
      "No spam or repeated posts",
      "Civil discussion only",
      "No calls for violence",
      "Stay relevant to libertarian topics",
    ],
    moderators: ["FreedomFirst", "LimitedGovt", "LibertySpeaker"],
    banner: "/images/libertarian-banner.jpg",
    color: "yellow",
  },
  independent: {
    id: "independent",
    name: "Independent",
    description:
      "A community for independent voters and those who don't align with major political parties.",
    members: 10547,
    created: "2021-07-30",
    rules: [
      "Keep discussions civil",
      "No partisan attacks",
      "Focus on issues, not parties",
      "Respect diverse viewpoints",
      "Provide evidence for claims",
    ],
    moderators: ["CentristView", "NonPartisan", "IndependentThinker"],
    banner: "/images/independent-banner.jpg",
    color: "purple",
  },
  conservative: {
    id: "conservative",
    name: "Conservative",
    description:
      "Community for discussing conservative values, policies, and perspectives.",
    members: 12765,
    created: "2021-09-05",
    rules: [
      "Be respectful to other members",
      "No profanity or obscene content",
      "Stay on topic",
      "No trolling or baiting",
      "Support claims with evidence",
    ],
    moderators: ["TraditionKeeper", "ConservativeVoice", "HeritageDefender"],
    banner: "/images/conservative-banner.jpg",
    color: "darkred",
  },
  socialist: {
    id: "socialist",
    name: "Socialist",
    description:
      "A forum for discussion of socialist politics, theory, and advocacy.",
    members: 9876,
    created: "2021-10-12",
    rules: [
      "No bigotry or discrimination",
      "Be respectful of differing socialist perspectives",
      "No promotion of violence",
      "Educate, don't insult",
      "Cite sources when possible",
    ],
    moderators: ["CollectiveAction", "SocialEquality", "WorkersUnited"],
    banner: "/images/socialist-banner.jpg",
    color: "darkred",
  },
};

// Mock posts data
const MOCK_POSTS: PostType[] = [
  {
    id: 1,
    author: "DemocratUser1",
    content:
      "Thoughts on the latest policy changes? I think they show real progress in addressing climate issues. #ClimateAction",
    likes: 45,
    isLiked: false,
    commentsCount: 12,
    createdAt: "2025-03-12T10:30:00Z",
  },
  {
    id: 2,
    author: "ProgressiveVoter",
    content:
      "Just attended a local campaign event. The energy was amazing! So many young people getting involved in the political process. #Democracy #YouthVote",
    likes: 78,
    isLiked: true,
    commentsCount: 23,
    createdAt: "2025-03-14T08:15:00Z",
  },
  {
    id: 3,
    author: "PolicyAnalyst",
    content:
      "Breaking down the new healthcare proposal: What it means for families and how it compares to previous systems. Thread 🧵",
    likes: 132,
    isLiked: false,
    commentsCount: 45,
    createdAt: "2025-03-15T14:22:00Z",
  },
  {
    id: 4,
    author: "GrassrootsOrganizer",
    content:
      "Our community outreach program is expanding to five new districts! Looking for volunteers to help spread the word about voting rights. DM me if interested! #CommunityAction",
    likes: 67,
    isLiked: false,
    commentsCount: 18,
    createdAt: "2025-03-16T11:05:00Z",
  },
  {
    id: 5,
    author: "HistoryBuff",
    content:
      "Today marks the anniversary of a significant legislative achievement. It's important to remember how we got here and the work that remains. #History #Progress",
    likes: 95,
    isLiked: false,
    commentsCount: 27,
    createdAt: "2025-03-17T09:45:00Z",
  },
];

const CommunityPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isNotificationsOn, setIsNotificationsOn] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;

  useEffect(() => {
    if (id && typeof id === "string") {
      // Fetch community data
      setLoading(true);

      // In a real app, this would be an API call
      setTimeout(() => {
        const communityData = COMMUNITIES[id];

        if (communityData) {
          setCommunity(communityData);
          // Mock joined status based on localStorage
          const joinedCommunities = JSON.parse(
            localStorage.getItem("joinedCommunities") || "[]"
          );
          setIsJoined(joinedCommunities.includes(id));

          // Mock notification status
          const notifiedCommunities = JSON.parse(
            localStorage.getItem("notifiedCommunities") || "[]"
          );
          setIsNotificationsOn(notifiedCommunities.includes(id));

          // Load posts for this community
          setPosts(MOCK_POSTS);
        }

        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleJoinCommunity = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(`/community/${id}`));
      return;
    }

    // Toggle joined status
    setIsJoined((prev) => !prev);

    // In a real app, this would be an API call
    // For now, just store in localStorage
    const joinedCommunities = JSON.parse(
      localStorage.getItem("joinedCommunities") || "[]"
    ) as string[];

    if (isJoined) {
      // Remove from joined communities
      const filtered = joinedCommunities.filter((c) => c !== id);
      localStorage.setItem("joinedCommunities", JSON.stringify(filtered));
    } else {
      // Add to joined communities
      if (typeof id === "string") {
        joinedCommunities.push(id);
        localStorage.setItem(
          "joinedCommunities",
          JSON.stringify(joinedCommunities)
        );
      }
    }
  };

  const handleToggleNotifications = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(`/community/${id}`));
      return;
    }

    if (!isJoined) {
      // Join the community first
      handleJoinCommunity();
    }

    // Toggle notification status
    setIsNotificationsOn((prev) => !prev);

    // In a real app, this would be an API call
    // For now, just store in localStorage
    const notifiedCommunities = JSON.parse(
      localStorage.getItem("notifiedCommunities") || "[]"
    ) as string[];

    if (isNotificationsOn) {
      // Remove from notified communities
      const filtered = notifiedCommunities.filter((c) => c !== id);
      localStorage.setItem("notifiedCommunities", JSON.stringify(filtered));
    } else {
      // Add to notified communities
      if (typeof id === "string") {
        notifiedCommunities.push(id);
        localStorage.setItem(
          "notifiedCommunities",
          JSON.stringify(notifiedCommunities)
        );
      }
    }
  };

  const handlePostCreated = () => {
    // In a real app, this would refresh posts from the server
    // For now, just add a mock post at the top
    const newPost: PostType = {
      id: Math.floor(Math.random() * 1000) + 100,
      author: user.username || "Anonymous",
      content: "This is a new post I just created!",
      likes: 0,
      isLiked: false,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-4 flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  // Community not found
  if (!community) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Community Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The community &quot;{id}&quot; doesn&apos;t exist or may have
                been removed.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/community")}
              >
                Back to Communities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Community Banner */}
      <div
        className="w-full h-40 bg-gradient-to-r from-primary/80 to-primary/30 relative"
        style={{
          backgroundImage: `url(${community.banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        {/* Community Header */}
        <Card className="shadow-lg border border-border mb-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  {community.name}
                  <Badge
                    variant="outline"
                    className="ml-2 bg-primary/10 text-primary"
                  >
                    {community.members.toLocaleString()} members
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {community.description}
                </CardDescription>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={isJoined ? "outline" : "default"}
                  className={`${
                    isJoined ? "border-primary/50 text-primary" : ""
                  }`}
                  onClick={handleJoinCommunity}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isJoined ? "Joined" : "Join"}
                </Button>

                {isJoined && (
                  <Button
                    variant="outline"
                    className={`${
                      isNotificationsOn ? "border-primary/50" : ""
                    }`}
                    onClick={handleToggleNotifications}
                  >
                    {isNotificationsOn ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Created {new Date(community.created).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Posts & Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post (if logged in and joined) */}
            {isAuthenticated && isJoined && (
              <Card className="shadow-md border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Create Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <PostForm onPostCreated={handlePostCreated} />
                </CardContent>
              </Card>
            )}

            {/* Community Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="posts">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="hot">
                  <Flame className="h-4 w-4 mr-2" />
                  Hot
                </TabsTrigger>
                <TabsTrigger value="trending">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
              </TabsList>

              {/* Posts Tab Content */}
              <TabsContent value="posts">
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to post in this community!
                    </p>
                    {!isJoined && (
                      <Button className="mt-4" onClick={handleJoinCommunity}>
                        Join to Post
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Hot Tab Content */}
              <TabsContent value="hot">
                <div className="space-y-4">
                  {posts
                    .sort((a, b) => b.likes - a.likes)
                    .map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                </div>
              </TabsContent>

              {/* Trending Tab Content */}
              <TabsContent value="trending">
                <div className="space-y-4">
                  {posts
                    .sort((a, b) => {
                      // Handle undefined commentsCount with fallback to 0
                      const aComments = a.commentsCount ?? 0;
                      const bComments = b.commentsCount ?? 0;
                      return bComments - aComments;
                    })
                    .map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Community Info & Rules */}
          <div className="space-y-6">
            {/* About Community */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  About Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{community.description}</p>

                <div>
                  <div className="flex items-center mb-1">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {community.members.toLocaleString()} members
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Created {new Date(community.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!isJoined && (
                  <Button className="w-full" onClick={handleJoinCommunity}>
                    Join Community
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Community Rules */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Community Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {community.rules.map((rule, index) => (
                    <div key={index} className="pb-2">
                      <div className="font-medium">
                        {index + 1}. {rule}
                      </div>
                      {index < community.rules.length - 1 && (
                        <Separator className="mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Moderators */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Moderators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {community.moderators.map((mod, index) => (
                    <div key={index} className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={`/profile/${mod}`}
                        className="text-primary hover:underline"
                      >
                        u/{mod}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
