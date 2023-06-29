export default class Terminal {
  // brand to prefix in all logs
  public static brand: string = '[EXMA]';

  /**
   * Outputs an error log 
   */
  public static error(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[31m%s\x1b[0m');
  }

  /**
   * Outputs an info log 
   */
  public static info(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[34m%s\x1b[0m');
  }

  /**
   * Outputs a log 
   */
  public static output(
    message: string, 
    variables: string[] = [],
    color?: string
  ) {
    //add variables to message
    for (const variable of variables) {
      message = message.replace('%s', variable);
    }
    //add brand to message
    message = `${this.brand} ${message}`;
    //colorize the message
    if (color) {
      console.log(color, message);
      return;
    }
    //or just output the message
    console.log(message);
  }

  /**
   * Outputs a success log 
   */
  public static success(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[32m%s\x1b[0m');
  }

  /**
   * Outputs a system log 
   */
  public static system(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[35m%s\x1b[0m');
  }

  /**
   * Outputs a warning log 
   */
  public static warning(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[33m%s\x1b[0m');
  }
}