const API = "http://localhost:3000";
let token = "";

// LOGIN
async function login() {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (data.token) {
    token = data.token;
    localStorage.setItem("token", token);

    const user = JSON.parse(atob(token.split('.')[1]));

    // ✅ HIDE LOGIN SCREEN
    document.getElementById("loginContainer").style.display = "none";

    // ✅ SHOW MAIN APP
    document.getElementById("appContainer").classList.remove("hidden");

    // ROLE BASED VIEW
    if (user.role === "admin") {
      document.getElementById("adminPanel").classList.remove("hidden");
      loadAllWorks();
      loadUsers();
    } else {
      document.getElementById("memberPanel").classList.remove("hidden");
      loadMyWorks();
    }

  } else {
    alert("Login failed");
  }
}

// CREATE USER
async function createUser(){
  await fetch(API+"/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      name:name.value,
      email:email2.value,
      password:pass2.value,
      skills:skills.value.split(",")
    })
  });
  loadUsers();
}

// CREATE WORK
async function createWork(){
  await fetch(API+"/work",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:token
    },
    body:JSON.stringify({
      title:title.value,
      priority:priority.value,
      requiredSkills:reqSkills.value.split(","),
      dependencies:deps.value.split(",").map(d=>({task:d,type:"full"}))
    })
  });
  loadAllWorks();
}

// LOAD USERS (WORKLOAD + OVERLOAD)
async function loadUsers(){
  const res=await fetch(API+"/users",{headers:{Authorization:token}});
  const users=await res.json();

  usersDiv.innerHTML="";

  users.forEach(u=>{
    const load=u.capacity || 100;

    usersDiv.innerHTML+=`
      <div>
        <b>${u.name}</b>
        <div class="progress">
          <div class="progress-bar" style="width:${load}%"></div>
        </div>
        ${load>100?"<span style='color:red'>Overloaded</span>":""}
      </div>
    `;
  });
}

// LOAD WORKS
async function loadAllWorks(){
  const res=await fetch(API+"/work",{headers:{Authorization:token}});
  const data=await res.json();

  allWorks.innerHTML="";

  data.forEach(w=>{
    allWorks.innerHTML+=`
      <div class="${w.priority} ${w.status==='blocked'?'blocked':''}">
        <h3>${w.title}</h3>
        <p>Progress: ${w.progress}%</p>
        <p>Status: ${w.status}</p>
        <p>Deps: ${w.dependencies?.length}</p>

        <button onclick="assign('${w._id}')">Auto Assign</button>
      </div>
    `;
  });
}

// ASSIGN
async function assign(id){
  await fetch(API+"/assign/"+id,{
    method:"POST",
    headers:{Authorization:token}
  });
  loadAllWorks();
}

// STATUS CHECK
async function checkStatus(){
  const res=await fetch(API+"/work/status-check");
  const data=await res.json();

  statusBox.innerHTML=`
    <h4>Ready</h4>
    ${data.ready.map(w=>`<p class='ready'>${w.title}</p>`).join("")}
    <h4>Blocked</h4>
    ${data.blocked.map(w=>`<p class='blocked'>${w.title}</p>`).join("")}
  `;
}

// MEMBER WORK
async function loadMyWorks(){
  const res=await fetch(API+"/work",{headers:{Authorization:token}});
  const data=await res.json();

  const user=JSON.parse(atob(token.split('.')[1]));

  myWorks.innerHTML="";

  data.forEach(w=>{
    if(w.assignedTo && w.assignedTo._id===user.id){

      myWorks.innerHTML+=`
        <div>
          <h3>${w.title}</h3>
          <p>${w.progress}%</p>

          <input placeholder="Update %" id="p${w._id}">
          <button onclick="update('${w._id}')">Update</button>

          <button onclick="block('${w._id}')">Block</button>
          <button onclick="addNote('${w._id}')">Add Note</button>
        </div>
      `;
    }
  });
}

// UPDATE
async function update(id){
  const val=document.getElementById("p"+id).value;

  await fetch(API+"/work/"+id+"/progress",{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      Authorization:token
    },
    body:JSON.stringify({progress:val})
  });

  loadMyWorks();
}

// BLOCK
async function block(id){
  const reason=prompt("Reason");
  await fetch(API+"/work/"+id+"/block",{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({reason})
  });
  loadMyWorks();
}

// NOTE
function addNote(id){
  const note=prompt("Enter update");
  alert("Saved locally: "+note);
}