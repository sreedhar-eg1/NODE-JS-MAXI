import React, { Fragment, useEffect, useState } from "react";

import Backdrop from '../../Backdrop/Backdrop';
import Modal from '../../Modal/Modal';
import Input from '../../Form/Input/Input';
import FilePicker from '../../Form/Input/FilePicker';
import Image from '../../Image/Image';
import { required, length } from '../../../util/validators';
import { generateBase64FromImage } from "../../../util/image";

const createEmptyPostForm = () => ({
  title: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
  image: {
    value: "",
    valid: false,
    touched: false,
    validators: [required],
  },
  content: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
});

function FeedEdit(props) {
  const [postForm, setPostForm] = useState(createEmptyPostForm);
  const [formIsValid, setFormIsValid] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!props.editing) {
      return;
    }

    if (props.selectedPost) {
      const emptyPostForm = createEmptyPostForm();

      setPostForm({
        title: {
          ...emptyPostForm.title,
          value: props.selectedPost.title,
          valid: true,
        },
        image: {
          ...emptyPostForm.image,
          value: props.selectedPost.imagePath,
          valid: true,
        },
        content: {
          ...emptyPostForm.content,
          value: props.selectedPost.content,
          valid: true,
        },
      });
      setFormIsValid(true);
      setImagePreview(
        props.selectedPost.imagePath
          ? "http://localhost:8080/" + props.selectedPost.imagePath
          : null
      );
      return;
    }

    setPostForm(createEmptyPostForm());
    setFormIsValid(false);
    setImagePreview(null);
  }, [props.editing, props.selectedPost]);

  const postInputChangeHandler = (input, value, files) => {
    if (files && files[0]) {
      generateBase64FromImage(files[0])
        .then((base64) => {
          setImagePreview(base64);
        })
        .catch(() => {
          setImagePreview(null);
        });
    }

    setPostForm((currentPostForm) => {
      let isValid = true;
      for (const validator of currentPostForm[input].validators) {
        isValid = isValid && validator(value);
      }

      const updatedForm = {
        ...currentPostForm,
        [input]: {
          ...currentPostForm[input],
          valid: isValid,
          value: files && files[0] ? files[0] : value,
        },
      };

      setFormIsValid(
        Object.keys(updatedForm).every(
          (inputName) => updatedForm[inputName].valid
        )
      );

      return updatedForm;
    });
  };

  const inputBlurHandler = (input) => {
    setPostForm((currentPostForm) => ({
      ...currentPostForm,
      [input]: {
        ...currentPostForm[input],
        touched: true,
      },
    }));
  };

  const cancelPostChangeHandler = () => {
    setPostForm(createEmptyPostForm());
    setFormIsValid(false);
    setImagePreview(null);
    props.onCancelEdit();
  };

  const acceptPostChangeHandler = () => {
    props.onFinishEdit({
      title: postForm.title.value,
      image: postForm.image.value,
      content: postForm.content.value,
    });
    setPostForm(createEmptyPostForm());
    setFormIsValid(false);
    setImagePreview(null);
  };

  if (!props.editing) {
    return null;
  }

  return (
    <Fragment>
      <Backdrop onClick={cancelPostChangeHandler} />
      <Modal
        title="New Post"
        acceptEnabled={formIsValid}
        onCancelModal={cancelPostChangeHandler}
        onAcceptModal={acceptPostChangeHandler}
        isLoading={props.loading}
      >
        <form>
          <Input
            id="title"
            label="Title"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("title")}
            valid={postForm.title.valid}
            touched={postForm.title.touched}
            value={postForm.title.value}
          />
          <FilePicker
            id="image"
            label="Image"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("image")}
            valid={postForm.image.valid}
            touched={postForm.image.touched}
          />
          <div className="new-post__preview-image">
            {!imagePreview && <p>Please choose an image.</p>}
            {imagePreview && <Image imageUrl={imagePreview} contain left />}
          </div>
          <Input
            id="content"
            label="Content"
            control="textarea"
            rows="5"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("content")}
            valid={postForm.content.valid}
            touched={postForm.content.touched}
            value={postForm.content.value}
          />
        </form>
      </Modal>
    </Fragment>
  );
}

export default FeedEdit;
