"""Export database to csv file"""
# Standard dist imports
import os
import sys

# Third party imports

# Project level imports
from utils.db_utils import update_csv

# Module level constants

if __name__ == '__main__':
    start_date = '20190530'
    end_date = '20190530'

    source_dir = '/data6/phytoplankton-db/hab_in_vitro/images'

    date_files = sorted(os.listdir(source_dir))
    if start_date != end_date:
        desired_dates = date_files[
                        date_files.index(start_date): date_files.index(
                            end_date) + 1]  # include end date
    else:
        desired_dates = list(start_date)

    print('Updating database for dates: {}'.format(desired_dates))
    for date in desired_dates:
        rel_path = '001/00000_static_html'
        pred_json = os.path.join(source_dir, date, rel_path, 'gtruth.json')
        csv_fname = os.path.join(source_dir, date, rel_path, 'features.csv')
        print(f'Updating {date}')
        update_csv(csv_fname=csv_fname, pred_json=pred_json, save=False)
    print('Completed')

