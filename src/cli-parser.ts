export default class CliParser {
  constructor(
    private name: string,
    private args: Argument[],
    private options: Argument[]
  ) {
    this.options = [
      ...this.options,
      {
        identifier: "help",
        type: "flag",
        description: "Prints this help message",
        optional: true,
      },
    ];
    const optionalArgs = this.args.filter((a) => a.optional);
    const compulsoryArgs = this.args.filter((a) => !a.optional);
    this.args = [...compulsoryArgs, ...optionalArgs];
  }

  public parse(input: string[]): { [key: string]: any } | null {
    if (input.includes("--help")) {
      this.help();
      return null;
    }

    let optValues: { [key: string]: any } = {};

    const toBeRemovedInputs: number[] = [];
    for (let opt of this.options) {
      const setOptions = input.filter((i, index, arr) => {
        const isRelatedToOption =
          i.match(/^--/g) ||
          (arr[index - 1]?.match(/^--/g) &&
            !this.options.find(
              (o) => o.identifier === arr[index - 1].replace("--", "")
            )?.optional);
        if (isRelatedToOption) {
          toBeRemovedInputs.push(index);
        }
        return isRelatedToOption;
      });
      const index = setOptions.findIndex((i) => i === `--${opt.identifier}`);
      const getValue = () => {
        const value = input[index + 1];
        if (!value || value.match(/^--/g)) {
          console.error("Missing value for option " + opt.identifier);
          this.help();
          return null;
        }
        return value;
      };
      if (index > -1) {
        switch (opt.type) {
          case "flag":
            optValues[opt.identifier] = true;
            break;
          case "number":
            let value = getValue();
            if (!value) return null;
            optValues[opt.identifier] = Number.parseFloat(value);
            break;
          case "string":
            value = getValue();
            if (!value) return null;
            optValues[opt.identifier] = value;
          default:
            break;
        }
      } else if (!opt.optional) {
        console.error("Missing option --" + opt.identifier);
        this.help();
        return null;
      }
    }

    input = input.filter((_, i) =>
      !toBeRemovedInputs.find((tbri) => tbri === i)
    );

    let argValues: { [key: string]: any } = {};
    for (let arg of this.args) {
      let foundValue: boolean = false;
      inner: for (let i of input) {
        argValues[arg.identifier] = i;
        foundValue = true;
        break inner;
      }
      if (foundValue) {
        input = input.slice(1);
      } else if (!arg.optional) {
        console.error("Missing value for " + arg.identifier);
        this.help();
        return null;
      }
    }

    return {
      ...argValues,
      ...optValues,
    };
  }

  public help(): void {
    console.log("Help for " + this.name);
    console.log("Usage:");
    let argumentUsage = "";
    for (let arg of this.args) {
      argumentUsage += `<${arg.identifier}> `;
    }
    console.log("      " + this.name + " " + argumentUsage);
    console.log("Options:");
    for (let opt of this.options) {
      console.log(`--${opt.identifier}`);
      if (opt.description) console.log(`  ${opt.description}`);
    }
  }
}

export type Argument = {
  optional?: boolean;
  identifier: string;
  type: "number" | "string" | "flag";
  description?: string;
};
