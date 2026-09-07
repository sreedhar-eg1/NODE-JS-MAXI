import React, { useEffect, useState } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";
import { useParams } from "react-router-dom";

function SinglePost(props) {
  const { postId } = useParams();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const graphqlQuery = {
      query: `
        query {
          post(id: "${postId}") {
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
        }
      `,
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: "Bearer " + props.token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed to fetch status");
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error(
            resData.errors[0]?.message || "GraphQL request failed",
          );
        }

        if (!resData.data || !resData.data.post) {
          throw new Error("Post not found");
        }

        const post = resData.data.post;
        const imageUrl = post.imageUrl.replace(/\\/g, "/");

        setTitle(post.title);
        setAuthor(post.creator.name);
        setImage("http://localhost:8080/" + imageUrl);
        setDate(new Date(post.createdAt).toLocaleDateString("en-US"));
        setContent(post.content);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [postId, props.token]);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
}

export default SinglePost;
