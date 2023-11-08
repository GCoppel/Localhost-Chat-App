import React from "react";
import "./App.css";

// Returns a horizontal list of buttons with one button for each user ID string given. On button press, calls the given "updateFunc" function and passes in that button's string (a user's ID)
class ButtonList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      strings: props.strings, // The list of all the user IDs to generate buttons for
      lastClickedIndex: null, // Used to keep track of the most recently clicked on button
    };
  }

  // Function to call the passed in updateFunc on a button press and update the lastClickedIndex to point to the pressed button
  handleClick = (string, index) => {
    this.setState({ lastClickedIndex: index }); // Set lastClickedIndex to this button
    if (this.props.updateFunc) {
      // Check to make sure we have been given an updateFunc function first
      this.props.updateFunc(string); // Call the updateFunc and give it this button's string (a user ID)
    }
  };

  // Update the component whenever the given props change (happens when a user connects or disconnects)
  componentDidUpdate(prevProps) {
    if (prevProps.strings !== this.props.strings) {
      this.setState({ strings: this.props.strings });
    }
  }

  // Return the following UI components:
  render() {
    return (
      <div id="available-users">
        {
          // If there is at least one user, show the label "Available User", otherwise show nothing:
          this.state.strings == 0 ? <div></div> : <div>Available Users:</div>
        }
        {
          // Map each given string to a new button and set its className to 'selected' if it exists at the "lastClickedIndex" location:
          this.state.strings.map((string, index) => (
            <button
              key={index} // Set the key of this button (required by React for this type of generated content)
              onClick={ //Subscribe this button to the handleClick function
                () =>
                  this.handleClick( 
                    string,
                    index
                  )
              }
              className={ // Set the className of the button to 'selected' if it exists at the "lastClickedIndex" location. This styles the button differently through App.css
                this.state.lastClickedIndex === index
                  ? "selected"
                  : "unselected"
              }
            >
              {string /*The user ID text to be displayed on this button*/}
            </button>
          ))
        }
      </div>
    );
  }
}

export default ButtonList;
