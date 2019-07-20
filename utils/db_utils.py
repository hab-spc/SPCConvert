""" """
# Standard dist imports

# Third party imports

# Project level imports

# Module level constants

def loadDB(db_path):
    """Loads db into list of entries

    Args:
        db_fname (str): Abs path to the db

    Returns:
        list: List of db values

    """
    curr_db = ""
    with open(db_path, "r") as fconv:
        curr_db = fconv.read()

    db_entries = to_json_format(curr_db)
    return db_entries


def to_json_format(str_db):
    """Convert str db into python list of db values (json format)"""
    import json
    ind_opbrac = str_db.find("(") + 1
    str_dbt = str_db[ind_opbrac:]

    ind_brac = str_dbt.find(")")

    str_dbt = str_dbt[:ind_brac]
    ind_last_comma = len(str_dbt) - 2
    str_dbt = str_dbt[:ind_last_comma - 1] + str_dbt[ind_last_comma:]
    return json.loads(str_dbt)

def update_csv(csv_fname='meta.csv', pred_json='predictions.json', save=False):
    """ Update the csv file with new groundtruths

    Args:
        csv_fname: Abspath to  meta csv file to merge
        pred_json: Abspath to predictions json file to merge
        save: Flag to save csv file

    Returns:
        merged dataframe

    """
    import os
    import json
    import pandas as pd
    assert os.path.exists(csv_fname), print(csv_fname)
    assert os.path.exists(pred_json), print(pred_json)

    # Read in files and preprocess
    label_col = 'label'
    meta_df = pd.read_csv(csv_fname)
    pred = json.load(open(pred_json, 'rb'))

    # Drop outdated `label` column (used as gtruth in machine learning exp)
    meta_df = meta_df.drop(columns=label_col, axis=0)
    meta_df = meta_df.rename({'timestamp': 'image_timestamp'})

    # Preprocess prediction json
    pred_df = pd.DataFrame(pred['machine_labels'])
    # Fix formatting
    if pred_df.shape[0] < pred_df.shape[1]:
        pred_df = pred_df.transpose()
    pred_df['gtruth'] = pred_df['gtruth'].replace({False: 2})
    pred_df.loc[(pred_df['pred'] == 1) & (pred_df['gtruth'] == 2), 'gtruth'] = 0
    pred_df.loc[(pred_df['pred'] == 0) & (pred_df['gtruth'] == 2), 'gtruth'] = 1
    pred_df = pred_df.rename({'gtruth': label_col}, axis=1)

    # Merge based off image_id
    merged = meta_df.merge(pred_df, on='image_id')
    col_order = list(meta_df.columns.values)
    col_order = col_order[:7] + list(pred_df.columns.values) + col_order[7:]
    merged = merged[col_order]

    # Overwrite previous csv file with new gtruth
    if save:
        merged.to_csv(csv_fname, index=False)
    return merged
