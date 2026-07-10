import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import {
  Delete12Filled,
  Copy16Filled,
  SearchRegular,
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
  Input,
  Button,
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
import { SortAscIcon, SortDescIcon } from "lucide-react";
const columns = [
  { columnKey: "url", label: "Url", className: "w-full" },
  { columnKey: "created_at", label: "Created at", className: "w-62" },
  { columnKey: "", label: "", className: "w-62" },
];

function App() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [bookmarks, setBookmark] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    sort: "desc",
    page: 1,
    per_page: 10,
  });

  const getBookmarks = async () => {
    const res = await invoke("get_bookmarks", {
      params: {
        search: filter.search,
        per_page: filter.per_page,
        page: filter.page,
        sort: filter.sort,
      },
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

  const handleDelete = (id) => {
    const res = invoke("delete_bookmark", {
      params: {
        id,
      },
    });

    console.log(res);

    getBookmarks();
    setIsOpenModal(false);
  };

  const handleOpenModal = () => {
    setIsOpenModal((prev) => !prev);
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
                    <div className="flex gap-2">
                      <Dialog open={isOpenModal}>
                        <Button
                          icon={<Delete12Filled />}
                          appearance="subtle"
                          onClick={handleOpenModal}
                        >
                          Delete
                        </Button>
                        <DialogSurface>
                          <DialogBody>
                            <DialogTitle>Delete Bookmark?</DialogTitle>
                            <DialogContent>
                              Do you want delete this bookmark? this action
                              can't undo
                            </DialogContent>
                            <DialogActions>
                              <Button
                                appearance="primary"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </Button>
                              <Button
                                appearance="secondary"
                                onClick={handleOpenModal}
                              >
                                Close
                              </Button>
                            </DialogActions>
                          </DialogBody>
                        </DialogSurface>
                      </Dialog>
                      <Button icon={<Copy16Filled />} appearance="primary">
                        Copy
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!bookmarks.length && (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-600">You don't have bookmark yet</p>
            </div>
          )}
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
          ></CardFooter>
        </Card>
      </div>
    </main>
  );
}

export default App;
