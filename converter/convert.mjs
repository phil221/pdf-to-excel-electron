import { readPdfText } from "pdf-text-reader";
import xlsx from "json-as-xlsx";

export async function convert(fileName) {
  const pdfText = await readPdfText({
    url: fileName,
  });

  const segments = pdfText.split("\n").filter((s) => s && !/^[01]*$/i.test(s));

  const indexes = [];
  segments.forEach((seg, i) =>
    seg === "NEW ACTIVITY" ? indexes.push(i) : null
  );

  const fullActivityString = indexes
    .map((index, i) => {
      if (i === 0) {
        return segments.slice(index, indexes[i + 1]);
      }
      if (i === indexes.length - 1) {
        return segments.slice(index);
      }
      return segments.slice(index, indexes[i + 1]);
    })
    .flat();

  const dateRegex = /[0-9]{2}-[0-9]{2}$/;
  const isSpenderSegment = (seg) =>
    seg.includes(" CREDITS PURCHASES CASH ADV TOTAL ACTIVITY");
  const isTransactionSegment = (seg) => dateRegex.test(seg.split(" ")[0]);

  const spenderTransactionGroups = [];
  let spenderCounter = 0;

  fullActivityString.forEach((seg) => {
    if (isSpenderSegment(seg)) {
      const spender = seg.split(" ").slice(0, -6).join(" ").trim();
      spenderCounter++;

      spenderTransactionGroups.push({
        spender,
        transactions: [],
        spenderCounter,
      });
    }

    if (isTransactionSegment(seg)) {
      const currentGroup = spenderTransactionGroups.find(
        (group) => group.spenderCounter === spenderCounter
      );
      if (currentGroup) {
        currentGroup?.transactions.push(seg);
      }
    }
  });

  const parseTransaction = (spender, str) => {
    const transArray = str.split(" ");
    const postDate = transArray[0];
    const tranDate = transArray[1];
    const amount = transArray.at(-1);
    const desc = transArray.slice(2, -1).join(" ");

    return {
      spender,
      postDate,
      tranDate,
      desc,
      amount,
      category: "",
    };
  };

  const content = spenderTransactionGroups
    .map((group) => {
      const transactions = group.transactions;
      return transactions.map((t) => parseTransaction(group.spender, t));
    })
    .flat();

  const data = [
    {
      sheet: "Monthly Spend",
      columns: [
        { label: "Spender", value: "spender" },
        { label: "Post Date", value: "postDate" },
        { label: "Tran Date", value: "tranDate" },
        { label: "Transaction Description", value: "desc" },
        { label: "Amount", value: "amount" },
        { label: "Accounting Classification", value: "category" },
      ],
      content,
    },
  ];

  const settings = {
    fileName: "Elan_Statement_Summary",
    writeMode: "writeFile",
    writeOptions: {},
  };

  xlsx(data, settings);
}
