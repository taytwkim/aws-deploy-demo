
const baseURL = 'http://localhost:8080';

let posts = [];

async function addPost(){
  console.log("add post");

  const img = document.getElementById('addImg').files[0];
  const caption = document.getElementById('addImgCaption').value;
  
  if (img) {
    const formData = new FormData();
    formData.append("image", img);
    formData.append("caption", caption);

    const response = await axios.post(baseURL + "/api/posts", formData, { headers: {'Content-Type': 'multipart/form-data'}});

    // 입력값 (업로드 파일, 캡션) 초기화
    document.getElementById('addImg').value = ''
    document.getElementById('addImgCaption').value = ''
    addFields.style.display = 'none';
    const addToggleButton = document.getElementById('addToggleButton');
    addToggleButton.textContent = '추가';
    
    console.log(response.data);
    posts.unshift(response.data);
    displayPosts();
  }
  else{
    alert("파일을 읽을 수 없습니다.");
  }
}

async function deletePost(event){
  const id = event.target.postId;
  console.log("delete post ", id);
  await axios.delete(baseURL + "/api/posts/" + id);
  
  const index = posts.findIndex(post => post.id === id);
  console.log(index);
  posts.splice(index, 1);
  displayPosts();
}

async function getPosts(){
  console.log("get posts");
  
  const response = await axios.get(baseURL + "/api/posts");
  
  // const posts = response.data;
  posts = response.data;
  displayPosts();
}

// ===============================================================================

function displayPosts(){
  // 기존 포스트 삭제
  const postContainer = document.getElementById('postContainer');
  postContainer.innerHTML = '';

  if (posts.length > 0) {
    posts.forEach(post => { 
      insertPostToDocument(post.id, post.imageURL, post.caption);
    });
  }
  else{
    console.log("here?");
    const message = document.createElement('p');
    message.textContent = "게시물을 업로드 하세요!";
    postContainer.appendChild(message);
  }
}

// 서버에서 읽어 온 각 post의 id, imageURL, caption을 바탕으로 post를 구성하고 html 문서에 삽입
function insertPostToDocument(id, imageURL, caption){
  
  function createElement(type, className=''){
    const element = document.createElement(type);
    element.className = className;
    return element;
  }
  
  const postContainer = document.getElementById('postContainer');

  const postDiv = createElement('div', 'post-div');
  
  const avatarDiv = createElement('div', 'post-avatar-div');
  const avatar = createElement('img');
  avatar.src = './default-avatar.svg';
  avatarDiv.appendChild(avatar);
  postDiv.appendChild(avatarDiv);

  const img = createElement('img', 'img');
  img.src = imageURL
  postDiv.appendChild(img);
  
  const captionDiv = createElement('div', 'post-caption-div');
  const captionP = createElement('p');
  captionP.textContent = caption;
  captionDiv.appendChild(captionP);
  postDiv.appendChild(captionDiv);

  const postButtonDiv = createElement('div', 'post-button-div');
  const deleteButton = createElement('button');
  deleteButton.postId = id;
  deleteButton.textContent = '삭제';
  deleteButton.addEventListener('click', deletePost);
  
  postButtonDiv.appendChild(deleteButton);
  
  postDiv.appendChild(postButtonDiv);
  postContainer.appendChild(postDiv);
}

function toggleAddFields() {
  const addFields = document.getElementById('addFields');
  const addToggleButton = document.getElementById('addToggleButton');

  if (addFields.style.display === 'none') {
      addFields.style.display = 'block';
      addToggleButton.textContent = '닫기';
  }
  else {
    addFields.style.display = 'none';
    addToggleButton.textContent = '추가';
  }
}

window.addEventListener('load', getPosts);

const addToggleButton = document.getElementById('addToggleButton');
addToggleButton.addEventListener('click', toggleAddFields);

const addSubmitButton = document.getElementById('addSubmitButton');
addSubmitButton.addEventListener('click', addPost);
