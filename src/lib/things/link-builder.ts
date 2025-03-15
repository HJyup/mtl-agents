import { type Response as ThingsResponse } from "@/server/api/routers/things";

const buildThingLink = (response: ThingsResponse) => {
  const { type, query, title, notes, checklist, when } = response;

  const reformatedLink = {
    type,
    query: query ? query.split(" ").join("%20") : "",
    title: title ? title.split(" ").join("%20") : "",
    notes: notes ? notes.split(" ").join("%20") : "",
    checklist: checklist
      ? checklist
          .split(",")
          .map((item) => item.trim().split(" ").join("%20"))
          .join("%0A")
      : "",
    when: when ? when.split(" ").join("%20") : "",
  };
  if (response.type === "add") {
    return `things:///add?title=${reformatedLink.title}&notes=${reformatedLink.notes}&checklist-items=${reformatedLink.checklist}&when=${reformatedLink.when}`;
  }

  if (response.type === "search") {
    return `things:///search?query=${reformatedLink.query}`;
  }
  return "";
};

export default buildThingLink;
