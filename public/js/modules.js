const menuActions =
  '<div id="menuActions">' +
  '<a class="dropdown-item" href="/u">My profile</a>' +
  '<a class="dropdown-item d-none d-sm-none d-md-none d-lg-block d-xl-block" href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#uploadModal">Upload</a>' +
  '<a class="dropdown-item" href="javascript:void(0)" onclick="logout()">Sign out</a>' +
  "</div>";
const loginForm =
  '<div id="formLogin">' +
  '<form class="px-4 pt-3" id="loginForm" style="width: 260px;">' +
  '<div class="mb-3">' +
  '<label for="exampleDropdownFormEmail1" class="form-label">Email address</label>' +
  '<input type="email" class="form-control" id="email" placeholder="email@example.com" required>' +
  "</div>" +
  '<div class="mb-3">' +
  '<label for="exampleDropdownFormPassword1" class="form-label">Password</label>' +
  '<input type="password" class="form-control" id="password" placeholder="Password" required>' +
  "</div>" +
  '<button type="submit" class="btn btn-outline-dark" onclick="signIn(event)">Sign in</button>' +
  "<div>" +
  '<label for="googleLogin" style="display: block;">Also login with:</label>' +
  '<a href="javascript:void(0)" id="googleLogin" class="bi bi-google link-dark fs-3" onclick="loginUsingGoogle()"></a>' +
  "</div>" +
  "</form>" +
  '<div class="dropdown-divider"></div>' +
  '<a class="dropdown-item" href="/login" id="signUp">New around here? Sign up</a>' +
  "</div>";
const menuHTML =
  '<div class="bg-white shadow-sm container-xl">' +
  '<ul class="nav justify-content-center fs-3">' +
  '<li class="nav-item">' +
  '<a class="nav-link bi bi-house link-dark" style="line-height:1.75rem;" href="/"></a>' +
  "</li>" +
  '<li class="nav-item d-flex align-items-center bg-logo rounded-circle p-2 my-1" style="width: 45px; height:45px;">' +
  '<img src="/staticFiles/aproject.svg" tabindex="-1" alt="logo" class="user-selection-none" style="width:100%;">' +
  "</li>" +
  '<li class="nav-item" id="myDropdown">' +
  '<a class="nav-link bi bi-person link-dark" id="dropdownMenuButton" style="line-height:1.75rem;" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" href="#"></a>' +
  '<div class="dropdown-menu dropdown-menu-lg-end" aria-labelledby="dropdownMenuButton" id="dropdown">' +
  loginForm +
  "</div>" +
  "</li>" +
  "</ul>" +
  "</div>";
const uploadHTML =
  '<div class="modal fade" id="uploadModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="uploadModal" aria-hidden="true">' +
  '<div class="modal-dialog modal-dialog-centered modal-fullscreen-lg-down">' +
  '<div class="modal-content">' +
  '<div class="modal-header">' +
  '<h5 class="modal-title" id="staticBackdropLabel">Upload your audio</h5>' +
  '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
  "</div>" +
  '<div class="modal-body">' +
  '<h1 class="text-center" id="uploading"></h1>' +
  '<div class="progress" id="progressBar" style="display: none;">' +
  '<div class="progress-bar bg-secondary"  role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>' +
  "</div>" +
  '<form id="uploadFile">' +
  '<div class="form-floating mb-3">' +
  '<input type="text" name="title" class="form-control" id="floatingInputGrid" placeholder="title required" required>' +
  '<label for="floatingInputGrid">Title</label>' +
  "</div>" +
  '<div class="row g-3">' +
  '<div class="col-md">' +
  '<div class="input-group">' +
  '<input type="file" name="file" class="form-control" id="inputGroupFile02" accept="audio/*" required>' +
  "</div>" +
  "</div>" +
  '<div class="col-md">' +
  '<input type="checkbox" name="nsfw" class="btn-check" id="btn-check-outlined" autocomplete="off">' +
  '<label class="btn btn-outline-danger d-block" for="btn-check-outlined" data-bs-toggle="tooltip" data-bs-placement="top" title="is this audio NSFW?">NSFW</label>' +
  "</div>" +
  "</div>" +
  '<div class="form-floating mb-3 mt-3">' +
  '<textarea class="form-control" name="desc" placeholder="Leave a comment here" id="floatingTextarea2" style="height: 100px; max-height: 300px;"></textarea>' +
  '<label for="floatingTextarea2">Description</label>' +
  "</div>" +
  "</form>" +
  '<div id="menuAction" style="display: none;" class="text-center m-2">' +
  '<a class="btn btn-outline-secondary" id="toUpload" onclick="cleanView()">Keep uploading audios</a>' +
  '<a class="btn btn-outline-secondary" id="toAudio">Listen you audio</a>' +
  "</div>" +
  "</div>" +
  '<div class="modal-footer">' +
  '<button type="button" class="btn btn-outline-secondary mb-2" id="uploadButton" onclick="loadUpload()">Upload</button>' +
  "</div>" +
  "</div>" +
  "</div>" +
  "</div>";

const uploadFloatButton =
  '<div id="uploadBtn" class="rounded-circle text-light border border-2 d-lg-none" style="background: #CA2727; width: 75px; height: 75px;" data-bs-toggle="modal" data-bs-target="#uploadModal">' +
  '<span class="bi bi-mic fs-1 d-flex justify-content-center align-items-center" style="height: 100%;"></span>' +
  "</div>";

const requestForm = '<button class="btn btn-secondary">request</button>';
