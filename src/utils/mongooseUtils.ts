import {
  Document,
  InsertManyOptions,
  isValidObjectId,
  Model as MongooseModel,
  MongooseUpdateQueryOptions,
  ObjectId,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  SortOrder,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import { sanitizeQuery } from "./sanitizeQuery";
import { SanitizedData } from "../types/types";

type Settings<T> = {
  project?: ProjectionType<T>;
  options?: QueryOptions<T>;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null;
  sortOptions?: { override?: boolean };
};

// Find
export const findByIdAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  id: string | ObjectId,
  settings?: Settings<T>
): Promise<SanitizedData<T> | null> => {
  if (!isValidObjectId(id)) {
    console.warn(`Invalid ObjectId provided for model ${model.modelName}: ${id}`);
    return null;
  }

  const rawQuery = await model
    .findById(id, settings?.project, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as SanitizedData<T>;
};

export const findOneAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: RootFilterQuery<T>,
  settings?: Settings<T>
): Promise<SanitizedData<T> | null> => {
  const rawQuery = await model
    .findOne(filter, settings?.project, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as SanitizedData<T>;
};

export const findAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: RootFilterQuery<T>,
  settings?: Settings<T> & { returnArray?: boolean }
): Promise<SanitizedData<T>[] | null> => {
  const rawQuery = await model
    .find(filter, settings?.project, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions);

  if (rawQuery.length === 0 && !settings?.returnArray) return null;
  return sanitizeQuery(rawQuery) as SanitizedData<T>[];
};

// Update
export const updateByIdAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  id: string | ObjectId,
  update: UpdateQuery<T>,
  settings?: Omit<Settings<T>, "project">
): Promise<SanitizedData<T> | null> => {
  if (!isValidObjectId(id)) {
    console.warn(`Invalid ObjectId provided for model ${model.modelName}: ${id}`);
    return null;
  }

  const rawQuery = await model
    .findByIdAndUpdate(id, update, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as SanitizedData<T>;
};

export const updateOneAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: RootFilterQuery<T>,
  update: UpdateQuery<T>,
  settings?: Omit<Settings<T>, "project">
): Promise<SanitizedData<T> | null> => {
  const rawQuery = await model
    .findOneAndUpdate(filter, update, settings?.options)
    .populate(settings?.populate || [])
    .sort(settings?.sort, settings?.sortOptions);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as SanitizedData<T>;
};

export const updateManyAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: RootFilterQuery<T>,
  update: UpdateQuery<T> | UpdateWithAggregationPipeline,
  settings: { sanitize?: boolean; options: MongooseUpdateQueryOptions } & Omit<Settings<T>, "project" | "options"> & { returnArray?: boolean }
): Promise<SanitizedData<T>[] | UpdateWriteOpResult | null> => {
  const rawQuery = await model.updateMany(filter, update, settings?.options).sort(settings?.sort, settings?.sortOptions);

  if (settings?.options && settings.options.sanitize === undefined) settings = { ...settings, sanitize: true };

  if (rawQuery.modifiedCount === 0 && !settings?.returnArray) return null;
  if (!settings.options.sanitize) return rawQuery;
  return (await findAndSanitize(model, filter, settings)) as SanitizedData<T>[];
};

// Create
export const createAndSanitize = async <T extends Document<any, any, any>>(model: MongooseModel<T>, doc: T | Partial<T>): Promise<SanitizedData<T>> => {
  const rawQuery = await model.create(doc);
  return sanitizeQuery(rawQuery) as SanitizedData<T>;
};

export const insertManyAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  docs: T[] | Partial<T>[],
  settings?: { options?: InsertManyOptions }
): Promise<SanitizedData<T>[]> => {
  const rawQuery = await model.insertMany(docs, settings?.options ?? {});
  return sanitizeQuery(rawQuery) as SanitizedData<T>[];
};
