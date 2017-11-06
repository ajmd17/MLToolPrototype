class CsvSplitter {
  static split(csv: string) {
    let csvLines = csv.split('\n').map(line => line.split(',').map(part => part.trim()));

    // return csvLines.reduce((accum, line, i) => {
    //   let lineSplit = line.split(',');
    //   let lineParts = lineSplit.filter((el, i) => {
    //     if (el.length == 0 && i == lineSplit.length - 1) {
    //       return false;
    //     }
    //     return true;
    //   });

    //   if (lineParts.length == 0) {
    //     return accum;
    //   }

    //   return accum + lineParts.reduce((accum, part, i) => {
    //     return accum + part + ((i != lineParts.length - 1) ? ',' : '');
    //   }, '') + '\n';
    // }, '');
  }

  static join(csvSplit: string[][]) {
    return csvSplit.map((line) => {
      return line.join(',');
    }).join('\n');
  }
}

export default CsvSplitter;