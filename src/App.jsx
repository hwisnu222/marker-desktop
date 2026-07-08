import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import {
  FolderRegular,
  EditRegular,
  OpenRegular,
  DocumentRegular,
  PeopleRegular,
  DocumentPdfRegular,
  VideoRegular,
  Delete12Filled,
  ArrowExport16Filled,
  Copy16Filled,
  SearchRegular,
  MoreHorizontal20Regular,
  ArrowNextRegular,
  ArrowPreviousRegular,
} from "@fluentui/react-icons";
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
  Avatar,
  Input,
  Button,
  Divider,
  TableCellActions,
  Card,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  CardFooter,
  CardHeader,
} from "@fluentui/react-components";
import { Delete, Search, SortAscIcon, SortDescIcon } from "lucide-react";
const items = [
  {
    title: "Components / Button / Button - Docs ⋅ Storybook",
    url: "https://storybooks.fluentui.dev/react/?path=/docs/components-button-button--docs&globals=storybook_fluentui-react-addon_theme:teams-dark-v21",
    created_at: new Date().toLocaleString(),
  },
  {
    title: "Components / Button / Button - Docs ⋅ Storybook",
    url: "https://storybooks.fluentui.dev/react/?path=/docs/components-button-button--docs&globals=storybook_fluentui-react-addon_theme:teams-dark-v21",
    created_at: new Date().toLocaleString(),
  },
  {
    title: "Components / Button / Button - Docs ⋅ Storybook",
    url: "https://storybooks.fluentui.dev/react/?path=/docs/components-button-button--docs&globals=storybook_fluentui-react-addon_theme:teams-dark-v21",
    created_at: new Date().toLocaleString(),
  },
];

const columns = [
  { columnKey: "url", label: "Url", className: "w-full" },
  { columnKey: "created_at", label: "Created at", className: "w-62" },
  { columnKey: "", label: "", className: "w-62" },
];

function App() {
  const [bookmarks, setBookmark] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    sort: "desc",
    page: 1,
    per_page: 10,
  });
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const getBookmarks = async () => {
    const res = await invoke("get_bookmarks", {
      search: filter.search,
      per_page: filter.per_page,
      page: filter.page,
      sort: filter.sort,
    });
    setBookmark(res?.data);
    console.log(res?.data);
  };

  const handleChange = (event) => {
    const target = event.target;
    setFilter({
      ...filter,
      [target.name]: target.value,
    });
  };

  const handleSort = () => {
    const sortType = filter.sort === "desc" ? "asc" : "desc";
    setFilter({
      ...filter,
      sort: sortType,
    });
  };

  const handleGetBookmark = async () => {
    getBookmarks();
  };

  useEffect(() => {
    getBookmarks();
  }, []);

  useEffect(() => {
    getBookmarks();
  }, [filter.search, filter.sort, filter.page]);

  return (
    <main className="min-h-screen">
      <header className="px-4 py-4 flex gap-2 justify-between items-center ">
        <h2 className="text-xl">My Bookmarks</h2>
        {/* <Button icon={<ArrowExport16Filled />} appearance="primary"> */}
        {/*   Export */}
        {/* </Button> */}
      </header>

      <div className="p-4 flex flex-col gap-2">
        <Card>
          <div className="flex gap-2 justify-between">
            <Input
              placeholder="Search bookmark..."
              contentAfter={<SearchRegular />}
              name="search"
              onChange={handleChange}
            />
            <div className="flex gap-2">
              <Button appearance="secondary" onClick={handleGetBookmark}>
                Refresh
              </Button>
              <Button
                icon={
                  filter.sort == "desc" ? <SortDescIcon /> : <SortAscIcon />
                }
                appearance="secondary"
                onClick={handleSort}
              >
                Sort
              </Button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader header={<h3 className="text-md">All Links</h3>} />
          <Table arial-label="Default table" size="medium">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell
                    key={column.columnKey}
                    className={column?.className}
                  >
                    {column.label}
                  </TableHeaderCell>
                ))}
                <TableHeaderCell></TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookmarks?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="w-1/2">
                    <TableCellLayout
                      description={<p className="line-clamp-1">{item.url}</p>}
                      className="line-clamp-1"
                    >
                      <p className="line-clamp-1">{item.title}</p>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>{item.created_at}</TableCell>
                  <TableCell>
                    {/* <Button icon={<Delete12Filled />}>Delete</Button> */}
                    {/* <TableCellActions> */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger disableButtonEnhancement>
                          <Button icon={<Delete12Filled />} appearance="subtle">
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogSurface>
                          <DialogBody>
                            <DialogTitle>Delete Bookmark?</DialogTitle>
                            <DialogContent>
                              Do you want delete this bookmark? this action
                              can't undo
                            </DialogContent>
                            <DialogActions>
                              <Button appearance="primary">Do Something</Button>
                              <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary">Close</Button>
                              </DialogTrigger>
                            </DialogActions>
                          </DialogBody>
                        </DialogSurface>
                      </Dialog>
                      <Button icon={<Copy16Filled />} appearance="primary">
                        Copy
                      </Button>
                    </div>

                    {/* </TableCellActions> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <CardFooter
            action={
              <div>
                <Button
                  appearance="transparent"
                  icon={<ArrowPreviousRegular />}
                  aria-label="More options"
                />
                <Button
                  appearance="transparent"
                  icon={<ArrowNextRegular />}
                  aria-label="More options"
                />
              </div>
            }
          >
            {/* <Button icon={<ArrowReply16Regular />}>Reply</Button> */}
            {/* <Button icon={<Share16Regular />}>Share</Button> */}
          </CardFooter>
        </Card>
      </div>

      {/* <form */}
      {/*   className="row" */}
      {/*   onSubmit={(e) => { */}
      {/*     e.preventDefault(); */}
      {/*     greet(); */}
      {/*   }} */}
      {/* > */}
      {/*   <input */}
      {/*     id="greet-input" */}
      {/*     onChange={(e) => setName(e.currentTarget.value)} */}
      {/*     placeholder="Enter a name..." */}
      {/*   /> */}
      {/*   <button type="submit">Greet</button> */}
      {/* </form> */}
      {/* <p>{greetMsg}</p> */}
    </main>
  );
}

export default App;
