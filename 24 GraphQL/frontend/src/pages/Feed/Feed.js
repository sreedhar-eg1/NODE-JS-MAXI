import React, { Fragment, useCallback, useEffect, useState } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

function Feed(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  const catchError = useCallback((caughtError) => {
    setError(caughtError);
  }, []);

  const loadPosts = useCallback(
    (direction) => {
      if (direction) {
        setPostsLoading(true);
        setPosts([]);
      }

      let page = postPage;
      if (direction === "next") {
        page += 1;
      }
      if (direction === "previous") {
        page -= 1;
      }

      if (direction) {
        setPostPage(page);
      }

      fetch("http://localhost:8080/feed/posts?page=" + page, {
        headers: {
          Authorization: "Bearer " + props.token,
        },
      })
        .then((res) => {
          if (res.status !== 200) {
            throw new Error("Failed to fetch posts.");
          }
          return res.json();
        })
        .then((resData) => {
          setPosts(
            resData.posts.map((post) => ({
              ...post,
              imagePath: post.imageUrl.replace(/\\/g, "/"),
            })),
          );
          setTotalPosts(resData.totalItems);
          setPostsLoading(false);
        })
        .catch(catchError);
    },
    [catchError, postPage, props.token],
  );

  useEffect(() => {
    fetch("URL")
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        return res.json();
      })
      .then((resData) => {
        setStatus(resData.status);
      })
      .catch(catchError);

    fetch("http://localhost:8080/feed/posts?page=1", {
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch posts.");
        }
        return res.json();
      })
      .then((resData) => {
        setPosts(
          resData.posts.map((post) => ({
            ...post,
            imagePath: post.imageUrl.replace(/\\/g, "/"),
          })),
        );
        setTotalPosts(resData.totalItems);
        setPostsLoading(false);
      })
      .catch(catchError);
  }, [catchError, props.token]);

  const statusUpdateHandler = useCallback(
    (event) => {
      event.preventDefault();
      fetch("URL")
        .then((res) => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Can't update status!");
          }
          return res.json();
        })
        .then((resData) => {
          console.log(resData);
        })
        .catch(catchError);
    },
    [catchError],
  );

  const newPostHandler = useCallback(() => {
    setIsEditing(true);
  }, []);

  const startEditPostHandler = useCallback(
    (postId) => {
      const loadedPost = posts.find((post) => post._id === postId);
      if (!loadedPost) {
        return;
      }

      setEditPost({ ...loadedPost });
      setIsEditing(true);
    },
    [posts],
  );

  const cancelEditHandler = useCallback(() => {
    setIsEditing(false);
    setEditPost(null);
  }, []);

  const finishEditHandler = useCallback(
    (postData) => {
      setEditLoading(true);

      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("image", postData.image);

      const graphqlQuery = {
        query: `
          mutation CreatePost($postInput: PostInputData!) {
            createPost(postInput: $postInput) {
              _id
              title
              content
              imageUrl
              createdAt
              creator {
                name
              }
              updatedAt
            }
          }
        `,
        variables: {
          postInput: {
            title: postData.title,
            content: postData.content,
            imageUrl: "Some text url for now",
          },
        },
      };

      fetch("http://localhost:8080/graphql", {
        method: "POST",
        body: JSON.stringify(graphqlQuery),
        headers: {
          Authorization: "Bearer " + props.token,
          'Content-Type': 'application/json'
        },
      })
        .then((res) => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Creating or editing a post failed!");
          }
          return res.json();
        })
        .then((resData) => {
          // GraphQL puts errors here even on a 200 response
          if (resData.errors) {
            throw new Error(
              resData.errors[0]?.message ||
                "Creating or editing a post failed!",
            );
          }

          const postResult = resData.data.createPost;

          const post = {
            _id: postResult._id,
            title: postResult.title,
            content: postResult.Content, // matches schema's capital "Content"
            creator: postResult.creator,
            createdAt: postResult.createdAt,
            imageUrl: postResult.imageUrl,
            imagePath: postResult.imageUrl.replace(/\\/g, "/"),
          };

          setPosts((currentPosts) => {
            if (editPost) {
              const postIndex = currentPosts.findIndex(
                (currentPost) => currentPost._id === editPost._id,
              );

              if (postIndex === -1) {
                return currentPosts;
              }

              const updatedPosts = [...currentPosts];
              updatedPosts[postIndex] = post;
              return updatedPosts;
            }

            if (currentPosts.length < 2) {
              return currentPosts.concat(post);
            }

            return currentPosts;
          });

          setIsEditing(false);
          setEditPost(null);
          setEditLoading(false);
        })
        .catch((err) => {
          console.error(err); // helpful during development
          setIsEditing(false);
          setEditPost(null);
          setEditLoading(false);
          setError(err.message || "Something went wrong!");
        });
    },
    [editPost, props.token],
  );

  const statusInputChangeHandler = useCallback((input, value) => {
    setStatus(value);
  }, []);

  const deletePostHandler = useCallback(
    (postId) => {
      setPostsLoading(true);
      fetch("http://localhost:8080/feed/post/" + postId, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + props.token,
        },
      })
        .then((res) => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Deleting a post failed!");
          }
          return res.json();
        })
        .then(() => {
          setPosts((currentPosts) =>
            currentPosts.filter((post) => post._id !== postId),
          );
          setPostsLoading(false);
        })
        .catch(() => {
          setPostsLoading(false);
        });
    },
    [props.token],
  );

  const errorHandler = useCallback(() => {
    setError(null);
  }, []);

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts("previous")}
            onNext={() => loadPosts("next")}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
}

export default Feed;
