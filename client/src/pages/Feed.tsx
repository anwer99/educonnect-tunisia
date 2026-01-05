import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  TrendingUp,
  Image,
  Smile,
} from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timestamp: Date;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
}

/**
 * Social Feed Page - THE SOCIAL WORLD
 * LinkedIn-style feed with posts, likes, and comments
 */
export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: "Fatima Khaled",
        avatar: "FK",
        role: "Mentor • Mathématiques",
      },
      timestamp: new Date(Date.now() - 2 * 3600000),
      content:
        "🎓 Viens de terminer ma 100ème session de tutorat ! Merci à tous mes étudiants pour leur engagement et leur passion pour l'apprentissage. C'est gratifiant de voir les progrès ! 📈",
      likes: 42,
      comments: [
        {
          id: 1,
          author: "Ahmed Ben Ali",
          avatar: "AB",
          content: "Bravo Fatima ! Continuez comme ça ! 👏",
          timestamp: new Date(Date.now() - 1800000),
        },
      ],
      liked: false,
    },
    {
      id: 2,
      author: {
        name: "Mohamed Saïdi",
        avatar: "MS",
        role: "Étudiant • Classe 3ème",
      },
      timestamp: new Date(Date.now() - 4 * 3600000),
      content:
        "Enfin ! J'ai réussi mon contrôle de Physique ! 🎉 Grâce à l'aide de mon mentor sur EduConnect, j'ai compris les concepts difficiles. Merci à la communauté ! 🙏",
      likes: 28,
      comments: [],
      liked: false,
    },
    {
      id: 3,
      author: {
        name: "Leila Mansouri",
        avatar: "LM",
        role: "Parent • Suiveur",
      },
      timestamp: new Date(Date.now() - 6 * 3600000),
      content:
        "Mon fils progresse tellement depuis qu'il utilise EduConnect ! Les notes de ses professeurs me montrent une vraie amélioration. Plateforme excellente ! 👍",
      likes: 35,
      comments: [],
      liked: false,
    },
  ]);

  const [newPost, setNewPost] = useState("");
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [newComments, setNewComments] = useState<Record<number, string>>({});

  const handlePostSubmit = () => {
    if (!newPost.trim()) {
      toast.error("Veuillez écrire quelque chose");
      return;
    }

    const post: Post = {
      id: posts.length + 1,
      author: {
        name: "Vous",
        avatar: "V",
        role: "Utilisateur",
      },
      timestamp: new Date(),
      content: newPost,
      likes: 0,
      comments: [],
      liked: false,
    };

    setPosts([post, ...posts]);
    setNewPost("");
    toast.success("Post publié ! 🎉");
  };

  const toggleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCommentSubmit = (postId: number) => {
    const comment = newComments[postId];
    if (!comment?.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: post.comments.length + 1,
                  author: "Vous",
                  avatar: "V",
                  content: comment,
                  timestamp: new Date(),
                },
              ],
            }
          : post
      )
    );

    setNewComments({ ...newComments, [postId]: "" });
    toast.success("Commentaire ajouté ! 💬");
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
        {/* Main Feed - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  V
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Partagez votre réussite académique... 🎓"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-20 resize-none border-gray-200"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Image className="w-5 h-5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                    <Button
                      onClick={handlePostSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Publier
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Posts Feed */}
          {posts.map((post) => (
            <Card key={post.id} className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.author.name}
                      </h3>
                      <p className="text-sm text-gray-500">{post.author.role}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {post.timestamp.toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-800 leading-relaxed">{post.content}</p>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between py-3 border-y border-gray-200 text-sm text-gray-600">
                  <span>{post.likes} likes</span>
                  <span>{post.comments.length} commentaires</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-gray-600 hover:text-red-600"
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        post.liked ? "fill-red-600 text-red-600" : ""
                      }`}
                    />
                    {post.liked ? "Aimé" : "Aimer"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 text-gray-600"
                    onClick={() =>
                      setExpandedComments(
                        expandedComments === post.id ? null : post.id
                      )
                    }
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Commenter
                  </Button>
                  <Button variant="ghost" className="flex-1 text-gray-600">
                    <Share2 className="w-5 h-5 mr-2" />
                    Partager
                  </Button>
                </div>

                {/* Comments Section */}
                {expandedComments === post.id && (
                  <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                    {/* Existing Comments */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg px-3 py-2">
                            <p className="font-semibold text-sm text-gray-900">
                              {comment.author}
                            </p>
                            <p className="text-sm text-gray-800">
                              {comment.content}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {comment.timestamp.toLocaleTimeString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* New Comment Input */}
                    <div className="flex gap-3 mt-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        V
                      </div>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Écrivez un commentaire..."
                          value={newComments[post.id] || ""}
                          onChange={(e) =>
                            setNewComments({
                              ...newComments,
                              [post.id]: e.target.value,
                            })
                          }
                          className="border-gray-200"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCommentSubmit(post.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar - Trending Topics - 1/3 width */}
        <div className="hidden lg:block space-y-6">
          {/* Search */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 border-gray-200 bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Tendances en Tunisie</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { topic: "#Baccalauréat2026", posts: "2.4K posts" },
                { topic: "#MathématiquesAvancées", posts: "1.8K posts" },
                { topic: "#Orientation", posts: "1.2K posts" },
                { topic: "#Concours", posts: "956 posts" },
                { topic: "#Étudier", posts: "742 posts" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="w-full text-left hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.topic}
                  </p>
                  <p className="text-xs text-gray-500">{item.posts}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* University Events */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <h3 className="font-bold text-gray-900">Événements Académiques</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Webinaire Orientation",
                  date: "Demain à 18h",
                  icon: "📚",
                },
                {
                  title: "Atelier Préparation Concours",
                  date: "Samedi 10h",
                  icon: "🎯",
                },
                {
                  title: "Conférence Carrière",
                  date: "Dimanche 15h",
                  icon: "💼",
                },
              ].map((event, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200"
                >
                  <p className="font-semibold text-sm text-gray-900">
                    {event.icon} {event.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
