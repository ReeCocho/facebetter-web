import "./Modal.css";

function Modal({ title, confirmDelete, cancelDelete }) {
  return (
    <>
      <div className="modal">
        <div className="modal__container">
        <p className="modal__title">Register</p>
        <form class="login__formR">
          <input
            class="inputBoxR loginNameR"
            type="email"
            placeholder="  Email"
          />
          <input
            class="inputBoxR loginNameR"
            type="text"
            placeholder="  Username"
          />
          <input
            class="inputBoxR loginPasswordR"
            type="password"
            placeholder="  Password"
          />
          <input
            class="inputBoxR loginPasswordR"
            type="password"
            placeholder="  Confirm Password"
          />
          <div className="name">
            <input
              class="inputBoxR loginPasswordR"
              type="password"
              placeholder="  First Name"
            />
            <input
              class="inputBoxR loginPasswordR"
              type="password"
              placeholder="  Last Name"
            />
          </div>
          <button
            type="submit"
            id="registerButton"
            class="buttons inputBoxR"
            value="Create New Account"
          >
            Create New Account
          </button>
        </form>
        </div>
      </div>
      <div className="backdrop" />
    </>
  );
}

export default Modal;
