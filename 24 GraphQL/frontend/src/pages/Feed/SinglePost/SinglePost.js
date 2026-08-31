import React, { useEffect, useState } from "react";

import Image from '../../../components/Image/Image';
import "./SinglePost.css";

function SinglePost(props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const postId = props.match.params.postId;

    fetch("http://localhost:8080/feed/post/" + postId, {
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch status");
        }
        return res.json();
      })
      .then((resData) => {
        const imageUrl = resData.post.imageUrl.replace(/\\/g, "/");
        setTitle(resData.post.title);
        setAuthor(resData.post.creator.name);
        setImage("http://localhost:8080/" + imageUrl);
        setDate(new Date(resData.post.createdAt).toLocaleDateString("en-US"));
        setContent(resData.post.content);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.match.params.postId, props.token]);

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
